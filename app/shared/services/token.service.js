// Token Service

var StellarSdk = StellarSdk;
var Utility = Utility;
var Config = Config;

var token = angular.module('tokenService', []);
var server = "";

if ( Config.General.production) {
  StellarSdk.Network.usePublicNetwork();
  server = new StellarSdk.Server(Config.Stellar.liveNetwork);
}

if ( !Config.General.production) {
  StellarSdk.Network.useTestNetwork();
  server = new StellarSdk.Server(Config.Stellar.testNetwork);
}


token.factory('Token', function($http, $rootScope) {

	var self = {};

	self = {
        createAsset : function(tokenData) {

					console.log(tokenData);
					var messages = [];
					var issuerAcct = Utility.validateSeed(tokenData.issuerSecret);
					var distAcct = Utility.validateSeed(tokenData.distSecret);
					var asset = false;
          var setFlags = 0;

					if (!issuerAcct) {
						messages.push("Invalid Issuer Secret Key");
					}else{
						asset = Utility.generateAsset(tokenData.assetType, tokenData.assetCode, issuerAcct.publicKey());
					}

					if (!distAcct) {
						messages.push("Invalid Distributor Secret Key");
					}

					if (!asset) {
						messages.push("Invalid Asset Code");
					}

					if (!tokenData.amount || tokenData.amount <= 0 || Number.isNaN(tokenData.amount)) {
						messages.push("Invalid Amount");
					}

					if (tokenData.issuerSecret == tokenData.distSecret) {
						messages.push("Issuer and Distributor can not be the same");
					}

          if (tokenData.distType) {
            if (!tokenData.distAmount || tokenData.distAmount <= 0 || Number.isNaN(tokenData.distAmount)) {
              messages.push("Invalid Distribution Amount");
            }
            if (!tokenData.distPrice || tokenData.distPrice <= 0 || Number.isNaN(tokenData.distPrice)) {
              messages.push("Invalid Distribution Price");
            }
          }


					if (messages.length > 0) {
						return Utility.returnError(messages);
					}

          // override default server
          if (tokenData.networkType) {
            if (tokenData.networkType == 1) {
              StellarSdk.Network.useTestNetwork();
              server = new StellarSdk.Server(Config.Stellar.testNetwork);
            }

            if (tokenData.networkType == 2) {
              StellarSdk.Network.usePublicNetwork();
              server = new StellarSdk.Server(Config.Stellar.liveNetwork);
            }
          }

          // load issuer account
          return server.loadAccount(issuerAcct.publicKey())
            .catch(StellarSdk.NotFoundError, function(error) {
              messages.push('Issuer Account not active');
              throw new Error('InvalidAccount');
            })
            .then(function(issuer) {
              // issuerAcct = issuer;
              // Load dist. account on stellar
              return server.loadAccount(distAcct.publicKey());
            })
            .catch(StellarSdk.NotFoundError, function(error) {
              messages.push('Distributing Account not active');
              throw new Error('InvalidAccount');
            })
            .then(function(base) {

              var transaction = new StellarSdk.TransactionBuilder(base);
              var operationObj = {};

              if (tokenData.requireAuth) {
                setFlags += 1;
              }

              if (tokenData.revokeAuth) {
                setFlags += 2;
              }
              // set flag options
              if (setFlags > 0) {
                operationObj.setFlags = setFlags;
                operationObj.source = issuerAcct.publicKey();
                transaction.addOperation(StellarSdk.Operation.setOptions(operationObj));
              }

              // change trust
              operationObj = {};
              operationObj.asset = asset;
              operationObj.source = distAcct.publicKey();
              transaction.addOperation(StellarSdk.Operation.changeTrust(operationObj));

              // allow trust
              if (setFlags > 0) {
                operationObj = {};
                operationObj.trustor = distAcct.publicKey();
                operationObj.assetCode = tokenData.assetCode;
                operationObj.authorize = true;
                operationObj.source = issuerAcct.publicKey();
                transaction.addOperation(StellarSdk.Operation.allowTrust(operationObj));
              }

              // send asset to dist
              operationObj = {};
              operationObj.destination = distAcct.publicKey();
              operationObj.asset = asset;
              operationObj.amount = tokenData.amount.toString();
              operationObj.source = issuerAcct.publicKey();
              transaction.addOperation(StellarSdk.Operation.payment(operationObj));

              // lockAccount
              if (tokenData.lockAccount) {
                operationObj = {};
                operationObj.masterWeight = 1;
                operationObj.lowThreshold = 1;
                operationObj.medThreshold = 2;
                operationObj.highThreshold = 3;
                operationObj.source = issuerAcct.publicKey();
                transaction.addOperation(StellarSdk.Operation.setOptions(operationObj));
              }

              // place offer on stellar DEX
              if (tokenData.distType) {
                operationObj = {};
                operationObj.selling = asset;
                operationObj.buying = StellarSdk.Asset.native();
                operationObj.amount = tokenData.distAmount.toString();
                operationObj.price = tokenData.distPrice;
                operationObj.source = distAcct.publicKey();
                transaction.addOperation(StellarSdk.Operation.manageOffer(operationObj));
              }

              // build and sign transaction
              var builtTx = transaction.build();
              builtTx.sign(StellarSdk.Keypair.fromSecret(issuerAcct.secret()));
              builtTx.sign(StellarSdk.Keypair.fromSecret(distAcct.secret()));

              //send build tx to server
              return server.submitTransaction(builtTx);

            })
            .then(function(result) {
							console.log('Success! Results:', result);
							messages.push('Asset created successfully');
              messages.push('Asset: '+tokenData.assetCode);
              messages.push('Issuer: '+issuerAcct.publicKey());
              messages.push('Distributor: '+distAcct.publicKey());
							return Utility.returnSuccess(messages);
						})
						.catch(function(error) {
							console.log(error);
							var errorMessages = Utility.extractError(error);
							errorMessages.forEach(function(m) {
								messages.push(m);
							});
							throw new Error('TxError');
						})
						.catch(function(error) {
							console.error(error);
							return Utility.returnError(messages);
						});



        },

	};


  return self;

});
