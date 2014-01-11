Accounts.validateNewUser ->
  true
fs = Npm.require('fs')
path = Npm.require('path')
stream = Npm.require('stream')
TEST = new Meteor.Collection("test")

Meteor.methods

  insert_human: (args) ->
    a = DATA.findOne(name: 'humans')
    args.human.type = a._id
    DATA.insert(args.human)

  input_select: (args) ->
    if args.input
      d = new Meteor.Collection.ObjectID(args.field)
      a = DATA.find({$and: [{type: d}, $or: [{name: { $regex: args.input, $options: 'i' }}, {country: { $regex: args.input, $options: 'i' }}]]}, { limit: 5, fields: {name: 1, country: 1} } ).fetch()
      _.map a, (val) ->
        val.str = val._id._str
        delete val._id
      return a

  save_contact_json: (args) ->
    a = DATA.findOne(name: 'humans')
    b = DATA.find(type: a._id).fetch()
    _.map b, (object) ->
      object.type = "humans"
      object
    c = path.join('/Users/Adithep/Desktop/αSys/json', 'contacts.json')
    fs.writeFile c, JSON.stringify(b), (err) ->
      if err
        throw err
      else
        console.log "done"


Meteor.publish "type", ->
  DATA.find(type: "type")

Meteor.publish "list", ->
  contact_button = DATA.findOne(name: "contact_button_list", type: "type")
  initials_list = DATA.findOne(name: "initials_list", type: "type")
  DATA.find($or: [{type: contact_button._id}, {type: initials_list._id}, {type: "type"}])

Meteor.publish "countries_list", ->
  b = DATA.findOne(name: "countries_list", type: "type")
  DATA.find({type: b._id}, {sort: {name: 1}, fields: {name: 1, type: 1, callingCode: 1, cca2: 1}})

Meteor.publish "currency", ->
  b = DATA.findOne(name: "currency", type: "type")
  DATA.find({type: b._id}, {sort: {name: 1}, fields: {name: 1, type: 1, symbol: 1, usd_exchange_rate: 1, country: 1, default: 1}})

Meteor.publish "cities_list", (args) ->
  if args.input
    d = new Meteor.Collection.ObjectID(args.field)
    DATA.find({$and: [{type: d}, $or: [{name: { $regex: args.input, $options: 'i' }}, {country: { $regex: args.input, $options: 'i' }}]]}, { limit: 5, fields: {name: 1, country: 1, type: 1} } )

Meteor.publish "initials_list", ->
  b = DATA.findOne(name: "initials_list", type: "type")
  if b
    DATA.find({type: b._id})

removeman = ->
  b = DATA.findOne(name: "contact_button_list")
  c = DATA.findOne(name: "contact_input_list")
  if b
    DATA.remove({type: b._id})
  if c
    DATA.remove({type: c._id})

Meteor.startup ->

  shit = DATA.findOne(name: "contact_button_list", type: "type")
  shit1 = DATA.findOne(name: "initials_list", type: "type")
  shit2 = DATA.findOne(name: "currency", type: "type")
  shit3 = DATA.findOne(name: "countries_list", type: "type")



  ###

  currency = EJSON.parse(Assets.getText("currency.json"))

  _.map currency, (obj) ->
    b = DATA.find(currency: obj.name, type: shit3._id).fetch()
    c = []
    d = []
    if b
      _.map b, (jack) ->
        c.push(jack._id)
        d.push(jack.name)

      DATA.insert(name: obj.name, usd_exchange_rate: obj.usd_exchange_rate, type: shit2._id, country: c, country_name: d, symbol: obj.symbol, symbol_native: obj.symbol_native, currency_name: obj.currency_name, currency_code: obj.currency_code, currency_name_plural: obj.currency_name_plural)

  console.log "Done"


  

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




  c = path.join('/Users/Adithep/Desktop/αSys/json', 'currency.json')
  h = DATA.find({type: shit2._id}, {fields: _id: 0, country: 0}).fetch()
  _.map h, (obj) ->
    obj.type = "currency"
    return
  fs.writeFile c, EJSON.stringify(h, indent: true), (err) ->
    if err
      throw err
    else
      console.log "done"

  ###

  if DATA.find().count() is 0

    #JSON
    types = EJSON.parse(Assets.getText("types.json"))
    countries = EJSON.parse(Assets.getText("countries.json"))
    button_list = EJSON.parse(Assets.getText("button_list.json"))
    initials_list = EJSON.parse(Assets.getText("initials_list.json"))
    cities_list = EJSON.parse(Assets.getText("cities.json"))

    #Map

    j = []

    _.map types, (num) ->
      j[num.name] = DATA.insert(num)
      num


    _.map countries, (num) ->
      a = num.type
      num.type = j[a]
      DATA.insert(num)

    _.map initials_list, (num) ->
      a = num.type
      num.type = j[a]
      DATA.insert(num)

    _.map button_list, (num) ->
      a = num.type
      num.type = j[a]
      if num.select_database
        b = num.select_database
        num.select_database = j[b]
      DATA.insert(num)

    _.map cities_list, (num) ->
      a = num.type
      b = num.country
      c = DATA.findOne(name: b)
      num.type = j[a]
      num.country_id = c._id
      DATA.insert(num)

    console.log "Done"

  else if DATA.find(type: shit._id).count() is 0

    button_list = EJSON.parse(Assets.getText("button_list.json"))

    _.map button_list, (num) ->
      a = DATA.findOne(name: num.type)
      num.type = a._id
      _.map num.input, (numa) ->
        if numa.select_database
          b = DATA.findOne(name: numa.select_database)
          numa.select_database = b._id
          return
        if numa.input_select_database
          b = DATA.findOne(name: numa.input_select_database)
          numa.input_select_database = b._id
          return
      DATA.insert(num)

    console.log "button lists inserted"

  else if DATA.find(type: shit1._id).count() is 0

    initials_list = EJSON.parse(Assets.getText("initials_list.json"))

    _.map initials_list, (num) ->
      a = DATA.findOne(name: num.type)
      num.type = a._id
      DATA.insert(num)

    console.log "initials lists inserted"
    

