// Create the main myMSALObj instance
// configuration parameters are located at authConfig.js
const myMSALObj = new Msal.UserAgentApplication(msalConfig);

function signIn() {
  myMSALObj.loginPopup(loginRequest)
    .then(loginResponse => {
        console.log("id_token acquired at: " + new Date().toString());
        console.log(loginResponse);  
        
        if (myMSALObj.getAccount()) {
          updateUI();
        }
        
    }).catch(error => {
      console.log(error);

      // Error handling
      if (error.errorMessage) {
        // Check for forgot password error
        // Learn more about AAD error codes at https://docs.microsoft.com/en-us/azure/active-directory/develop/reference-aadsts-error-codes
        if (error.errorMessage.indexOf("AADB2C90118") > -1) {
          myMSALObj.loginPopup(b2cPolicies.authorities.forgotPassword)
            .then(loginResponse => {
              console.log(loginResponse);
              window.alert("Password has been reset successfully. \nPlease sign-in with your new password.");
            })
        }
      }
    });
}

// Sign-out the user
function logout() {
  // Removes all sessions, need to call AAD endpoint to do full logout
  myMSALObj.logout();
  updateUI();
}

function getTokenPopup(request) {
  return myMSALObj.acquireTokenSilent(request)
    .catch(error => {
      console.log("Silent token acquisition fails. Acquiring token using popup");
      console.log(error);
      // fallback to interaction when silent call fails
      return myMSALObj.acquireTokenPopup(request)
        .then(tokenResponse => {
          console.log("access_token acquired at: " + new Date().toString());
          return tokenResponse;
        }).catch(error => {
          console.log(error);
        });
    });
}

function editProfile() {
  myMSALObj.loginPopup(b2cPolicies.authorities.editProfile)
    .then(tokenResponse => {
        console.log("access_token acquired at: " + new Date().toString());
        console.log(tokenResponse);
    });
}

function refreshItems() {
  getTokenPopup(tokenRequest)
  .then(tokenResponse => {
      console.log("access_token acquired at: " + new Date().toString());
      try {
        console.log("Login success. Initializing todo list view model");
        viewmodel = new SPA_WebAPI_Client.itemListViewModel(apiConfig.webApi, tokenResponse.accessToken);
        viewmodel.init();
      } catch(err) {
        console.log(err);
      }
  }); 
}
