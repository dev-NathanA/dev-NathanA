/*
* @Author: Saurabh Kumar
* @DATE: 9/9/2024
* @File: background.js
* @Description: It is service worker runing in the background in order detection any malpractice during the exam, and send the data to the server.
*/

const serverUrl = 'https://prutor.cse.iith.ac.in:8443/track/';

let logQueue = [];
let activeTabId;
let networkStatus = true;


//function to accumlate logs in local storage when there is no network. 
function accumulateLog(logData) {
  logQueue.push(logData);  // Accumulate the log in queue
  chrome.storage.local.set({ logQueue: logQueue });
}

chrome.storage.sync.get('logQueue', function(result) {
  if (result.logQueue) {
      logQueue = result.logQueue;
      console.log('Recovered log queue from storage:', logQueue);
  }
});


function sendAccumulateLog() {
  if (logQueue.length === 0) {
    console.log('No logs to send.');
    return;
  }

  // Send each log to the server
  logQueue.forEach(log => {
    fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(log)
    }).then(response => {
      if (response.ok) {
        console.log('Log sent successfully:', log);
        // Remove the log from the queue after successful send
        logQueue = logQueue.filter(l => l !== log);
        chrome.storage.sync.set({ logQueue: logQueue });
      }
    }).catch(error => {
        console.error('Failed to send log:', log, error);
    });
  });
}

//Check if student is trying open some other application other than the browser, as exam is going on prutor, a web based platform.
chrome.windows.onFocusChanged.addListener(async (windowID) => {
  if (windowID == chrome.windows.WINDOW_ID_NONE){
    console.log("Chrome lost focused");
    applicationChaneged("Another application might be opned");
  }
  if (windowID !== chrome.windows.WINDOW_ID_NONE){
    console.log("Tab change detected");
    applicationChaneged("Tab change detected");
  }
});

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleString(); // Returns a human-readable format (e.g., "9/26/2024, 10:32:30 AM")
}


function applicationChaneged(comment) {
  const curTime = getCurrentTime();

  if (navigator.onLine) {
    sendAccumulateLog();
  }

  chrome.storage.local.get('trackUser', function(data) {
    if (data.trackUser) {
      const userDetails = data.trackUser;
      const logData = {
        name: userDetails.name,
        roll: userDetails.roll,
        email: userDetails.email,
        url: " ",
        title: " ",
        time: curTime,
        content: " ",
        comment: comment
      }

      if (navigator.onLine) {
        fetch(serverUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(logData)
        })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
        })
        .catch((error) => {
          console.log('Error:', error);
        });
      } else {
        accumulateLog(logData);
      }
    }
  });
}

function getTabInfo(tabId, comment) {
  const curTime = getCurrentTime();

  if (navigator.onLine) {
    sendAccumulateLog();
  }
  
  chrome.tabs.get(tabId, function(tab) {
    var url = " ";
    try {
      url = tab.url;
    }
    catch(err) {
      console.log('Error:', err);
    }
    
    var title = " ";
    try {
      title = tab.title;
    }
    catch(err) {
      console.log('Error:', err);
    }

    chrome.storage.local.get('trackUser', function(data) {
      if (data.trackUser) {
        const userDetails = data.trackUser;
        const logData = {
          name: userDetails.name,
            roll: userDetails.roll,
            email: userDetails.email,
            url: url,
            title: title,
            time: curTime,
            content: " ",
            comment: comment
        }

        if (navigator.onLine) {
          fetch(serverUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(logData)
          })
          .then(response => response.json())
          .then(data => {
            console.log('Success:', data);
          })
          .catch((error) => {
            console.log('Error:', error);
          });
        } else {
          accumulateLog(logData);
        }
      }
    });
    
  });
}

// adding listner to check if new tab is activated. It maybe prutor itself or some other website. Log that information.
chrome.tabs.onActivated.addListener(function(activeInfo) {
  console.log("On tab activate");
  getTabInfo(activeTabId = activeInfo.tabId, "Tab change detected");
});


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(changeInfo.status === 'complete' && tab.active) {
    console.log("On tab update");
    getTabInfo(activeTabId=tabId, "Tab data updated");
  }
});


// sending ping message just to ensure system is alived.
function sendPing() {
  const curTime = getCurrentTime();

  if (navigator.onLine) {
    sendAccumulateLog();
  }

  chrome.storage.local.get('trackUser', function(data) {
    if (data.trackUser) {
      const userDetails = data.trackUser;

      fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: userDetails.name,
          roll: userDetails.roll,
          email: userDetails.email,
          url: " ",
          title: " ",
          time: curTime,
          content: " ",
          comment: 'ping'
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.log('Error:', error);
      });
    }
  });
}

const pingInterval = 15000;
setInterval(sendPing, pingInterval);


// listning message from the content script in order to detect copy, cut and paste event, and log this information.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

  if (navigator.onLine) {
    sendAccumulateLog();
  }

  if (request.action === "itp") {
    const curTime = getCurrentTime();
    chrome.storage.local.get('trackUser', function(data) {
      if (data.trackUser) {
        const userDetails = data.trackUser;

        const logData = {
          name: userDetails.name,
          roll: userDetails.roll,
          email: userDetails.email,
          url: request.url,
          title: " ",
          time: curTime,
          content: request.content,
          comment: request.type
        }

        if (navigator.onLine) {
          fetch(serverUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(logData)
          })
          .then(response => response.json())
          .then(data => {
            console.log('Success:', data);
          })
          .catch((error) => {
            console.log('Error:', error);
          });
        } else {
          accumulateLog(logData);
        }
      }
    });
  }
});