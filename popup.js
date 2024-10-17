
/*
* @Author: Saurabh Kumar
* @DATE: 9/9/2024
* @File: popup.js
* @Description: Code to store students details in the browser local storage. This information will be sent to server along with other event data.
*/

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get('trackUser', function(data) {
      if (data.trackUser) {
        document.getElementById('details').style.display = 'block';
        document.getElementById('displayUsername').innerText = data.trackUser.name;
        document.getElementById('displayRoll').innerText = data.trackUser.roll;
        document.getElementById('displayEmail').innerText = data.trackUser.email;
        document.getElementById('update').style.display = 'none';
      } else {
        document.getElementById('update').style.display = 'none';
        document.getElementById('details').style.display = 'block';
      }
    });
  
    document.getElementById('editButton').addEventListener('click', function() {
      chrome.storage.local.get('trackUser', function(data) {
        if (data.trackUser) {
          document.getElementById('name').value = data.trackUser.name;
          document.getElementById('roll').value = data.trackUser.roll;
          document.getElementById('email').value = data.trackUser.email;
        }
        document.getElementById('details').style.display = 'none';
        document.getElementById('update').style.display = 'block';
      });
    });
  
    document.getElementById('userForm').addEventListener('submit', function(event) {
      event.preventDefault();
      var name = document.getElementById('name').value;
      var roll = document.getElementById('roll').value;
      var email = document.getElementById('email').value;
  
      chrome.storage.local.set({ 'trackUser': { 'name': name, 'roll': roll, 'email': email } }, function() {
        console.log('User details saved');
        document.getElementById('displayUsername').innerText = name;
        document.getElementById('displayRoll').innerText = roll;
        document.getElementById('displayEmail').innerText = email;
        document.getElementById('details').style.display = 'block';
        document.getElementById('update').style.display = 'none';
      });
    });
  });
  