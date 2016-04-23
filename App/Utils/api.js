var Firebase = require('firebase');
var firebaseUrl = require('./config')
var _ = require('underscore');
var util = require('./location-util');

// Table Names: UserData, Friends, Groups, PeopleInGroups

var api = {

  // Add data to user, use after creating new user DONE
  setUserData(myData, name, phone) {
    var userId  = myData.uid;
    var userData = new Firebase(`${firebaseUrl}/UserData/${userId}`);

    userData.child('email').set(myData.password.email);
    userData.child('profileImageURL').set(myData.password.profileImageURL);
    userData.child('name').set(name);
    userData.child('phone').set(phone);
  },

  setUserLocation(myData, location) {
    var userId  = myData.uid;
    var userData = new Firebase(`${firebaseUrl}/UserData/${userId}`);

    userData.child('location').set(location);
  },

  updateUserData(myData, item, value) {
    var userId  = myData.uid;
    var userData = new Firebase(`${firebaseUrl}/UserData/${userId}`);

    if(item && value) {
      userData.child(item).set(value);
    }
  },

  // Add groups to Groups table DONE
  addGroup(groupName, groupDescription, userId) {
    // Add new group to Groups table
    var newGroup = new Firebase(`${firebaseUrl}/Groups/${groupName}`);
    // Set the description and add first member (the creator)
    newGroup.child('description').set(groupDescription);
    newGroup.child('members').push(userId);
    // Add group to creator's Groups table
    var myGroups = new Firebase(`${firebaseUrl}/UserData/${userId}/Groups`);
    myGroups.push(groupName);
  },

  // Add user to specific Group table DONE
  joinGroup(groupName, userId) {
    // Add user to group's Members table
    var groupToJoin = new Firebase(`${firebaseUrl}/Groups/${groupName}/members`);
    groupToJoin.push(userId);
    // Add group to user's Groups table
    var myGroups = new Firebase(`${firebaseUrl}/UserData/${userId}/Groups`);
    myGroups.push(groupName);
  },

  // Add user friends  to Friends table DONE
  addFriend(userId, friendId) {
    // Adding friend to my userdata Friends table
    var myFriends = new Firebase(`${firebaseUrl}/UserData/${userId}/Friends`);
    myFriends.push(friendId);

    // Adding myself to my friend's userdata Friends table.
    var theirFriends = new Firebase(`${firebaseUrl}/UserData/${friendId}/Friends`);
    theirFriends.push(userId);
  },

  // Get user data DONE
  getUserData(userId) {
    var userData = `${firebaseUrl}/UserData/${userId}.json`;
    return fetch(userData).then((res) => res.json());
  },

  getGroupData(groupName) {
    var groupData = `${firebaseUrl}/Groups/${groupName}.json`;
    return fetch(groupData).then((res) => res.json());
  },

  // Get all friends in my Groups table DONE
  getUserGroups(userId) {
    var groups = `${firebaseUrl}/UserData/${userId}/Groups.json`;
    return fetch(groups)
      .then((res) => res.json())
      .then((groups) => {
        // Create an async function since we need to wait for the promises to return data
        async function getGroupInfo (callback){
          var result = [];
          for (k in groups) {
            // Await waits for the promise chain to complete, then continues
            await callback(groups[k]).then((res) => {
              res.groupName = groups[k];
              result.push(res);
            });
          }
          // result is now populated with the friend's user data, and is returned to the user
          return result;
        };
        // Passing in the this.getUserData since the this binding is lost inside of the async function
        return getGroupInfo(this.getGroupData);
      });
  },

  // Get all friends in my Friends table DONE
  getUserFriends(userId) {
    var friends = `${firebaseUrl}/UserData/${userId}/Friends.json`;
    return fetch(friends)
      .then((res) => res.json())
      .then((friends) => {
        // Create an async function since we need to wait for the promises to return data
        async function getFriendData (callback){
          var result = [];
          for (k in friends) {
            // Await waits for the promise chain to complete, then continues
            await callback(friends[k]).then((res) => {
              res.uid = friends[k];
              result.push(res);
            });
          }
          // result is now populated with the friend's user data, and is returned to the user
          return result;
        };
        // Passing in the this.getUserData since the this binding is lost inside of the async function
        return getFriendData(this.getUserData);
      });
  },

  findUserByEmail(emailInput) {
    var users = firebaseUrl + '/UserData.json';
    return fetch(users)
      .then((res) => res.json())
      .then((users) => {
        async function searchFriendData(callback) {
          var results = [];
          for (k in users) {
            if (users[k].email) {
              if (users[k].email.toLowerCase().includes(emailInput.toLowerCase())) {
                console.log('find user by email', users[k])
                await callback(users[k]).then((res) => {
                  res.uid = k;
                  res.info = users[k];
                  results.push(res);
                });
              }
            }
          }
          return results;
        };
        return searchFriendData(this.getUserData);

      });
  },

  findGroupByName(nameInput) {
    var groups = firebaseUrl + '/Groups.json';
    return fetch(groups)
      .then(res => res.json())
      .then((groups) => {
        var results = [];
        for (k in groups) {
          if (k.toLowerCase().includes(nameInput.toLowerCase())) {
            groups[k].groupName = k
            results.push(groups[k]);
          }
        };
        return results;
      })

  },


  addListing(data, cb) {
    // var newGroup = new Firebase(`${firebaseUrl}/Groups/${groupName}`);
    var newListing = new Firebase(`${firebaseUrl}/Listings/${data.createdById}`);
    newListing.child('description').set(data.description);
    newListing.child('imgUrl').set(data.imgUrl);
    newListing.child('category').set(data.category);
    newListing.child('activity').set(data.activity);
    newListing.child('latitude').set(data.latitude);
    newListing.child('longitude').set(data.longitude);
    newListing.child('createdBy').set(data.createdBy);
    newListing.child('userId').set(data.createdById);
    cb();
  },

  getListings(location, miles, cb) {
    var listings = firebaseUrl + '/Listings.json';
      //TODO fetch listings within X miles
    return fetch(listings)
      .then(res => res.json())
      .then((listings) => {
        var filtered = _.filter(listings, (listing) => {
          return util.getDistanceFromLatLonInMiles(location.latitude, location.longitude, listing.latitude, listing.longitude) <= miles;
        })
        cb(filtered);
      })
  },

  deleteListing(id, cb) {
    var listing = new Firebase(`${firebaseUrl}/Listings/${id}`);
    listing.remove((error) => {
      if(error) {
        console.log('ERROR IN DATA DELETION');
      } else {
        console.log('DATA REMOVAL SUCCESSFUL');
      }
      cb();
    });
  },

  createChat(userId, username, description, cb) {
  var newChat = new Firebase(`${firebaseUrl}/chat/${userId}`);
  newChat.child('ownerName').set(username);
  newChat.child('ownerId').set(userId);
  newChat.child('description').set(description);
  newChat.child('messages').set({});
  cb();
  },
  
  destroyChat(ownerId, cb) {
    var chat = new Firebase(`${firebaseUrl}/chat/${ownerId}`);
    chat.remove((error) => {
      if(error) {
        console.log('ERROR IN CHAT DELETION');
      } else {
        console.log('CHAT REMOVAL SUCCESSFUL');

      }
      cb();
    });
  },

  checkAuthToken(token, callback) {
    var ref = new Firebase(`${firebaseUrl}/UserData/`);
    ref.authWithCustomToken(token, function(error, authData) {
      callback(error, authData);
    });
  }
};

module.exports = api;
