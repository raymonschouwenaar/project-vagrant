/**
 * UserController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
    
  'new': function (req, res) {
  	res.view();
  },

  create: function(req, res, next) {

    var userObj = {
      name: req.param('name'),
      title: req.param('title'),
      email: req.param('email'),
      password: req.param('password'),
      confirmation: req.param('confirmation'),
    }

  	// Create a user with the params sent from
  	// The sign-up form --> new.ejs
  	User.create(userObj, function userCreated (err, user) {

  		// If there's an error
  		// if(err) return next(err);

  		 if (err) {
	        console.log(err);
	        req.session.flash = {
	          err: err
	        }

	        // If error redirect back to sign-up page
	        return res.redirect('/user/new');
	      }

        // Log user in
        req.session.authenticated = true;
        req.session.User = user;

        // Change status to online
        user.online = true;
        user.save(function(err, user) {
          if(err) return next(err);

          // Add the action attribute to the user object for the flash message.
          user.action = " signed-up and logged-in."

          // Let other subscriberd sockets know that the user was created
          User.publishCreate(user);

          // After succesfully creating the user
          // Redirect to the show action
          if(!req.session.User.admin || !req.session.User.manager) {
            res.redirect('/user/show/'+user.id);
          }
        });
  	});
  },

  show: function(req, res, next) {
  	User.findOne(req.param('id'), function foundUser(err, user) {
  		// if user is not find output an error
  		if (err) return next(err);

  		// if the user is find
  		if(!user) return next();

  		// Show user
  		res.view({
  			user:user
  		});
  	});
  },

  index: function(req, res, next) {
    // Get an array of all users in the User collecction
  	User.find(function foundUsers(err, users) {
  		// if user is not find output an error
  		if (err) return next(err);

  		// pass the array down to the /view/index.ejs page
  		res.view({
  			users:users
  		});
  	});
  },

  edit: function(req, res, next) {
  	User.findOne(req.param('id'), function foundUser(err, user) {
  		// if user is not find output an error
  		if (err) return next(err);

  		// if the user is find
  		if(!user) return next('User doen\'t exist.');

  		// Show user
  		res.view({
  			user:user
  		});
  	});
  },

  update: function(req, res, next) {

    if(req.session.User.admin) {
      var userObj = {
        name: req.param('name'),
        familyname: req.param('familyname'),
        title: req.param('title'),
        email: req.param('email'),
        birthday: req.param('birthday'),
        phone: req.param('phone'),
        address: req.param('address'),
        postal: req.param('postal'),
        city: req.param('city'),
        country: req.param('country'),
        profileUrl: req.param('profileUrl'),
        admin: req.param('admin'),
        manager: req.param('manager'),
        employee: req.param('employee'),
      }
    }  else {
      var userObj = {
        name: req.param('name'),
        familyname: req.param('familyname'),
        title: req.param('title'),
        email: req.param('email'),
        birthday: req.param('birthday'),
        phone: req.param('phone'),
        address: req.param('address'),
        postal: req.param('postal'),
        city: req.param('city'),
        country: req.param('country'),
        profileUrl: req.param('profileUrl'),          
      }
    }

  	User.update(req.param('id'), userObj, function userUpdated(err) {
  		// if user is not find output an error
  		if(err) {
        console.log(err);
  			return res.redirect('/user/edit/' + req.param('id'));
  		}

  		res.redirect('/user/show/' + req.param('id'));
  	});
  },  

  destroy: function(req, res, next) {
  	User.findOne(req.param('id'), function foundUser(err, user) {
  		// if user is not find output an error
  		if (err) return next(err);

  		// if the user is find
  		if(!user) return next('User doen\'t exist.');

      var saved_user_name = user.name;

  		User.destroy(req.param('id'), function userDestroyed(err){
  			if (err) return next(err);

        // Inform other sockets (e.g. connected sockets that are subscribed) that this user is now logged in
        User.publishUpdate(user.id, {
          loggedIn: false,
          id: user.id,
          name: user.name,
          action: ' has destroyed.'
        });

        // Let other subscriberd sockets know that the user was destroyed
          User.publishDestroy(user.id);
  		});

  		res.redirect('/user');
  	});
  },

  /**
   * Action blueprints:
   *    `/user/delete/user.id`
   */
  delete: function(req, res, next) {
    User.findOne(req.param('id'), function foundUser(err, user) {
      // if user is not find output an error
      if (err) return next(err);

      // if the user is find
      if(!user) return next('User doen\'t exist.');

      // Show user
      res.view({
        user:user
      });
    });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */

   subscribe: function(req, res) {

    User.find(function foundUsers(err, users) {
      if(err) return next(err);

      // Subscribe this socket to the User model classroom
      User.subscribe(req.socket);

      // Subscribe this socket to the user instance rooms
      User.subscribe(req.socket, users);

      // This will avoid a warning from the socket for trying to render
      // html over the socket.
      res.send(200);

    });
   },

  
};
