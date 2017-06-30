
var StellarSdk = StellarSdk;

(function() {
  var Utility = {
  returnError: function(messages) {
    return new Promise(function(resolve, reject) {
                    var errObj = {  status: false,
                                    content: {
                                        message: messages
                                    }
                                  };
                    reject(errObj);
                });
  },

  returnSuccess: function(messages) {
    return new Promise(function(resolve, reject) {
                    var successObj = {status: true,
                                      content: {
                                        message: messages
                                      }
                                    };
                    resolve(successObj);
                });
  },

  validateSeed: function (seed) {
    var tempKeyPair = false;

    try{
      tempKeyPair = StellarSdk.Keypair.fromSecret(seed);

    }
    catch(error){
      console.log("Unable to generate keyPair");
      return false;

    }

    if (tempKeyPair) {
      return tempKeyPair;
    }
      return false;
  },
  extractError: function(error) {
    var rtnError = [];
    if (error.title) {
      rtnError.push(error.title);
    }

    if (error.code) {
      rtnError.push(error.code);
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNRESET') {
        rtnError.push(" Network Error. Please Try again");
      }
    }

    if (error.extras) {
      if(error.extras.result_codes){
        if (error.extras.result_codes.transaction) {
          rtnError.push("Transaction Error: "+error.extras.result_codes.transaction);
        }

        if (error.extras.result_codes.operations) {
          error.extras.result_codes.operations.forEach(function(ops) {
            rtnError.push("Operation Error: "+ops);
          });
        }

      }
    }

    if(error.data){
      if (error.data.content) {
        error.data.content.message.forEach(function(ops) {
            rtnError.push(ops);
          });
      }
    }

    return rtnError;
  },
  generateAsset: function(type,code,issuer) {
    console.log("type, code, issuer", type, code, issuer);

    if (type === null || typeof(type) === 'undefined') {
      return false;
    }else if (type === 0) {
      return StellarSdk.Asset.native();
    }else{
      if (code === 'undefined' || typeof(code) === 'undefined') {
        // code = "";
        return false;
      }

      if (issuer === 'undefined' || typeof(issuer) === 'undefined') {
        // issuer = "";
        return false;
      }

      var asset = "";
      try{
        asset =  new StellarSdk.Asset(code, issuer);
        return asset;
      }
      catch(error){
        return false;
      }

    }
  },
  isEmpty: function(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
  },
  validatePaymentInput: function (destAcct, amount, memoText) {
    try{
      // check its a stellar address or account ID

      if (destAcct.indexOf('*') < 0) {
        // not stellar address
        if (!StellarSdk.StrKey.isValidEd25519PublicKey(destAcct)) {
          return {status: false, content: {message: ['Invalid Destination Address']}};
        }
      }else{
        // stellar address
      }




      if (memoText.length > 28) {
        return {status: false, content: {message: ['memo can only have 28 characters']}};
      }

      if (isNaN(amount)) {
        return {status: false, content: {message: ['Please enter a valid amount']}};
      }

      return {status: true, content: {message: ['Input Validation successful']}};
    }
    catch(error){
      // To Do
      console.error("validatePaymentInput Error", error);
      return {status: false, content: {message: ['Input Validation failed']}};

    }
  },
  randomString: function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },


};
 window.Utility = Utility;
})();


