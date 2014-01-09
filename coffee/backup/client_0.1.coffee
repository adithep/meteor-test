Router.configure
  before: ->
    if Meteor.user() is null
      this.render('login')
      this.stop()
Router.map ->
  this.route 'layout',
    path: '/'
    layoutTemplate: 'layout'
    action: ->
  this.route 'moduleTest',
    path: 'moduletest'
    layoutTemplate: 'layout'
    action: ->
      Session.set("moduleTest-rr", Router.current().path)
      this.render('moduleTest')
      $('#child').empty()
  this.route 'moduleTest-param',
    path: 'moduletest/:ll'
    layoutTemplate: 'layout'
    action: ->
      this.render('moduleTest')
      n = this.params.ll
      routing(n)

routing = (n) ->
  if n
    if document.getElementById("child") isnt null
      if Meteor.user() isnt null
        b = n.split('-')
        
        c = $('#child').children().map ->
          $(this).attr('class')
        
        j = 0
        while c.length > b.length
          $("#child div:last-child").remove()
          c.splice(-1,1)

        _.map b, (num) ->
          if c is undefined
            if Template[num]
              UI.materialize(Template[num], document.getElementById("child"))
          else
            if not c[j]
              if Template[num]
                UI.materialize(Template[num], document.getElementById("child"))
            j++
  Session.set("moduleTest-rr", Router.current().path)


post =
  _dep: new Deps.Dependency()
  _value: [Template.an]
  get: ->
    this._dep.depend()
    this._value
  spush: (t) ->
    this._value.push(t)
    this._dep.changed()


Template.login.events
  'click #loginform': (e, t) ->
    Session.set('creatingAccount', false)
  'click #accountform': (e, t) ->
    Session.set('creatingAccount', true)
  'click #createaccount': (e, t) ->
    Session.set('creatingAccount', false)
    Accounts.createUser
      username: t.find('#username').value
      password: t.find('#password').value
      email: t.find('#email').value
      profile:
        name: t.find('#name').value
  'click #logout': (e, t) ->
    Meteor.logout()
  'click #login': (e, t) ->
    Meteor.loginWithPassword(t.find('#username').value, t.find('#password').value)

Template.layout.events
  'click #logout': (e, t) ->
    Meteor.logout(Router.go(window.location.pathname))

Template.moduleTest.helpers
  'click .click': (e, t) ->
    e.currentTarget.innerHTML = "hello"
    e.currentTarget
  



Template.moduleTest.helpers
  route: (args, options) ->
    h = Session.get("moduleTest-rr")
    if h
      d = h.split("/")
      console.log d[2]
      if d[2] is undefined
        a = "#{h}/#{args}"
      else
        if d[2].length is 0
          a = "#{h}#{args}"
        else
          a = "#{h}-#{args}"
      a

Deps.autorun ->
  h = Session.get("moduleTest-rr")
  if document.getElementById("child") isnt null
    if Meteor.user() isnt null
      j = 0
      $('#child').children().map ->
        $(this).children('.close').attr('href', "#{j}")
        j++

Template.postlists.helpers
  posts: ->
    post.get()

Template.login.helpers
  creatingAccount: ->
    Session.get("creatingAccount")

Template.an.rendered = ->
  console.log "an rendered"

Template.lu.rendered = ->
  console.log "lu rendered"

      