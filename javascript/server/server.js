var TEST, fs, path, removeman, stream;

Accounts.validateNewUser(function() {
  return true;
});

fs = Npm.require('fs');

path = Npm.require('path');

stream = Npm.require('stream');

TEST = new Meteor.Collection("test");

Meteor.methods({
  insert_human: function(args) {
    var a;
    a = DATA.findOne({
      name: 'humans'
    });
    args.human.type = a._id;
    return DATA.insert(args.human);
  },
  input_select: function(args) {
    var a, d;
    if (args.input) {
      d = new Meteor.Collection.ObjectID(args.field);
      a = DATA.find({
        $and: [
          {
            type: d
          }, {
            $or: [
              {
                name: {
                  $regex: args.input,
                  $options: 'i'
                }
              }, {
                country: {
                  $regex: args.input,
                  $options: 'i'
                }
              }
            ]
          }
        ]
      }, {
        limit: 5,
        fields: {
          name: 1,
          country: 1
        }
      }).fetch();
      _.map(a, function(val) {
        val.str = val._id._str;
        return delete val._id;
      });
      return a;
    }
  },
  save_contact_json: function(args) {
    var a, b, c;
    a = DATA.findOne({
      name: 'humans'
    });
    b = DATA.find({
      type: a._id
    }).fetch();
    _.map(b, function(object) {
      object.type = "humans";
      return object;
    });
    c = path.join('/Users/Adithep/Desktop/αSys/json', 'contacts.json');
    return fs.writeFile(c, JSON.stringify(b), function(err) {
      if (err) {
        throw err;
      } else {
        return console.log("done");
      }
    });
  }
});

Meteor.publish("type", function() {
  return DATA.find({
    type: "type"
  });
});

Meteor.publish("list", function() {
  var contact_button, initials_list;
  contact_button = DATA.findOne({
    name: "contact_button_list"
  });
  initials_list = DATA.findOne({
    name: "initials_list"
  });
  return DATA.find({
    $or: [
      {
        type: contact_button._id
      }, {
        type: initials_list._id
      }, {
        type: "type"
      }
    ]
  });
});

Meteor.publish("countries_list", function() {
  var b;
  b = DATA.findOne({
    name: "countries_list"
  });
  if (b) {
    return DATA.find({
      type: b._id
    }, {
      sort: {
        name: 1
      }
    }, {
      fields: {
        name: 1,
        type: 1
      }
    });
  }
});

Meteor.publish("cities_list", function(args) {
  var d;
  if (args.input) {
    d = new Meteor.Collection.ObjectID(args.field);
    return DATA.find({
      $and: [
        {
          type: d
        }, {
          $or: [
            {
              name: {
                $regex: args.input,
                $options: 'i'
              }
            }, {
              country: {
                $regex: args.input,
                $options: 'i'
              }
            }
          ]
        }
      ]
    }, {
      limit: 5,
      fields: {
        name: 1,
        country: 1,
        type: 1
      }
    });
  }
});

Meteor.publish("initials_list", function() {
  var b;
  b = DATA.findOne({
    name: "initials_list"
  });
  if (b) {
    return DATA.find({
      type: b._id
    });
  }
});

removeman = function() {
  var b, c;
  b = DATA.findOne({
    name: "contact_button_list"
  });
  c = DATA.findOne({
    name: "contact_input_list"
  });
  if (b) {
    DATA.remove({
      type: b._id
    });
  }
  if (c) {
    return DATA.remove({
      type: c._id
    });
  }
};

Meteor.startup(function() {
  var button_list, cities_list, countries, initials_list, j, shit, types;
  shit = DATA.findOne({
    name: "contact_button_list"
  });
  /*
  
  
  csv_file = path.join('/Users/Adithep/Desktop/αSys/csv', 'cities5000.txt')
  
  
  CSV()
  .from.stream(fs.createReadStream(csv_file), {delimiter:'\t'})
  .on("record", Meteor.bindEnvironment((row, index) ->
    a = DATA.findOne(cca2: row[8])
    if a
      DATA.insert(name: row[1], latitude: row[4], longitude: row[5], country: a.name, country_id: a._id, population: row[14], type: "city")
  , (error) ->
    console.log "Error in bindEnvironment:", error
  )).on("error", (err) ->
    console.log "Error reading CSV:", err
  ).on "end", (count) ->
    console.log count, "csv Done"
  
  
  
  
  c = path.join('/Users/Adithep/Desktop/αSys/json', 'cities.json')
  h = DATA.find({type: 'city'}, {fields: _id: 0}).fetch()
  fs.writeFile c, JSON.stringify(h), (err) ->
    if err
      throw err
    else
      console.log "done"
  */

  if (DATA.find().count() === 0) {
    types = EJSON.parse(Assets.getText("types.json"));
    countries = EJSON.parse(Assets.getText("countries.json"));
    button_list = EJSON.parse(Assets.getText("button_list.json"));
    initials_list = EJSON.parse(Assets.getText("initials_list.json"));
    cities_list = EJSON.parse(Assets.getText("cities.json"));
    j = [];
    _.map(types, function(num) {
      j[num.name] = DATA.insert(num);
      return num;
    });
    _.map(countries, function(num) {
      var a;
      a = num.type;
      num.type = j[a];
      return DATA.insert(num);
    });
    _.map(initials_list, function(num) {
      var a;
      a = num.type;
      num.type = j[a];
      return DATA.insert(num);
    });
    _.map(button_list, function(num) {
      var a, b;
      a = num.type;
      num.type = j[a];
      if (num.select_database) {
        b = num.select_database;
        num.select_database = j[b];
      }
      return DATA.insert(num);
    });
    _.map(cities_list, function(num) {
      var a, b, c;
      a = num.type;
      b = num.country;
      c = DATA.findOne({
        name: b
      });
      num.type = j[a];
      num.country_id = c._id;
      return DATA.insert(num);
    });
    return console.log("Done");
  } else if (DATA.find({
    type: shit._id
  }).count() === 0) {
    button_list = EJSON.parse(Assets.getText("button_list.json"));
    _.map(button_list, function(num) {
      var a, b;
      a = DATA.findOne({
        name: num.type
      });
      num.type = a._id;
      if (num.select_database) {
        b = DATA.findOne({
          name: num.select_database
        });
        num.select_database = b._id;
      }
      return DATA.insert(num);
    });
    return console.log("button lists inserted");
  }
});
