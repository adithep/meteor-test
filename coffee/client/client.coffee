class ALPHA


  Module:
    config: (pargs) ->

      _template: 'layout'

      init: (args) ->
        pargs.sb.config_router(template: @_template)

      destroy: (args) ->

    layout: (pargs) ->

      _template: 'layout'

      init: (args) ->
        a = pargs.sb.init(@)
        pargs.sb.map_event(a.events)

      'event click #logout': (args) ->
        pargs.sb.logout()


      destroy: (args) ->

    home: (pargs) ->

      init: (args) ->
        a = pargs.sb.init(@)
        pargs.sb.map_router(a.routes)

      'route home /': (args) ->


      destroy: (args) ->

    login: (pargs) ->

      _template: 'login'

      init: (args) ->
        a = pargs.sb.init(@)
        pargs.sb.map_event(a.events)
        pargs.sb.map_helpers(a.helpers)

      'helper creatingAccount': (args) ->
        pargs.sb.session_get(p: "creatingAccount")

      'event click #loginform': (args) ->
        pargs.sb.session_set(p: 'creatingAccount', v: false)

      'event click #accountform': (args) ->
        pargs.sb.session_set(p: 'creatingAccount', v: true)

      'event click #createaccount': (args) ->
        pargs.sb.session_set(p: 'creatingAccount', v: false)
        params =
          username: args.t.find('#username').value
          password: args.t.find('#password').value
          email: args.t.find('#email').value
          name: args.t.find('#name').value
        pargs.sb.create_account(params)

      'event click #login': (args) ->
        params =
          username: args.t.find('#username').value
          password: args.t.find('#password').value
        pargs.sb.login(params)

      'event click #logout': (args) ->
        pargs.sb.logout()

      destroy: (args) ->

    module_test: (pargs) ->

      _template: 'moduleTest'


      init: (args) ->
        a = pargs.sb.init(@)
        pargs.sb.map_router(a.routes)
        pargs.sb.map_event(a.events)
        pargs.sb.map_helpers(a.helpers)
        pargs.sb.autorun(actions: @autorun)

      autorun: (args) ->
        h = pargs.sb.session_get(p: "moduleTest-rr")
        if document.getElementById("child") isnt null
          if pargs.sb.user() isnt null
            j = 0
            pargs.sb.get_child(p: '#child').map ->
              k = pargs.sb.get_child(p: this, c: '.close')
              pargs.sb.set_attr(p: k, a: 'href', v: "#{j}")
              j++

      'helper route': (args) ->
        h = pargs.sb.session_get(p: "moduleTest-rr")
        if h
          d = h.split("/")
          if d[2] is undefined
            a = "#{h}/#{args.spacebar_arg}"
          else
            if d[2].length is 0
              a = "#{h}#{args.spacebar_arg}"
            else
              a = "#{h}-#{args.spacebar_arg}"
          a

      'route moduletest moduletest/:ll': (args) ->
        pargs.sb.session_set(p: "moduleTest-rr", v: Router.current().path)
        args.route_this.render('moduleTest')
        params =
          route_params: args.route_this.params.ll
        pargs.sb.routing(params)

      'route moduletest moduletest': (args) ->
        pargs.sb.session_set(p: "moduleTest-rr", v: Router.current().path)
        args.route_this.render('moduleTest')
        pargs.sb.empty_child(element: '#child')

      'event click .click': (args) ->
        args.e.currentTarget.innerHTML = "hello"
        args.e.currentTarget


      destroy: (args) ->

    post_lists: (pargs) ->

      _template: 'postlists'

      init: (args) ->
        a = pargs.sb.init(@)
        pargs.sb.map_helpers(a.helpers)

        pargs.post =
          _dep: new Deps.Dependency()
          _value: [Template.an]
          get: ->
            this._dep.depend()
            this._value
          spush: (t) ->
            this._value.push(t)
            this._dep.changed()
        pargs.post

      'helper posts': (args) ->
        pargs.post.get()

    add_contact: (pargs) ->

      _template: 'add_contact'


      init: (args) ->
        a = pargs.sb.init(@)
        pargs.input = @reactive_input
        pargs.session = false
       
        if a.routes
          pargs.sb.map_router(a.routes)
        if a.helpers
          pargs.sb.map_helpers(a.helpers)
        if a.events
          pargs.sb.map_event(a.events)
        if a.mcall
          pargs.sb.mcall(a.mcall)
        if a.subscribe
          pargs.sb.subscribe(a.subscribe)


      'subscribe list': (args) ->
        console.log "lists subscribed"
        b = DATA.findOne({select_name: "initials"}, {fields: _id: 0})
        c = DATA.findOne({input_name: "first_name"}, {fields: _id: 0})
        d = DATA.findOne({input_name: "company_name"}, {fields: _id: 0})
        if b
          pargs.input.spush('individual', b)
        if c
          pargs.input.spush('individual', c)
        if d
          pargs.input.spush('company', d)

      'subscribe countries_list': (args) ->
        console.log "countries subscribed"

      'route add_contact add_contact/:ll': (args) ->


      'route add_contact add_contact': (args) ->
        args.route_this.render('add_contact')

      'helper company': (args) ->
        pargs.sb.session_get(p: "company")

      'helper buttons_individual': (args) ->
        a = DATA.findOne(name: "contact_button_list")
        if a
          DATA.find($and: [type: a._id, individual: {$ne: 2}, input_starting: {$ne: 1}, select_starting: {$ne: 1}])

      'helper buttons_company': (args) ->
        a = DATA.findOne(name: "contact_button_list")
        if a
          DATA.find($and: [type: a._id, individual: {$ne: 1}, input_starting: {$ne: 1}, select_starting: {$ne: 1}])

      'helper countries': (args) ->
        if args.spacebar_arg
          console.log args.spacebar_arg
          DATA.find({type: _str: args.spacebar_arg})

      'helper input_select': (args) ->
        console.log args.spacebar_arg
        DATA.find(type: _str: args.spacebar_arg)

      'helper input_company': (args) ->
        pargs.input.get('company')

      'helper input_individual': (args) ->
        a = pargs.input.get('individual')
        console.log a
        a

      'event click .individual': (args) ->
        pargs.sb.session_set(p: 'company', v: false)

      'event click .company': (args) ->
        pargs.sb.session_set(p: 'company', v: true)

      'event focus .input_select': (args) ->
        if args.e.currentTarget.value is ""
          $('.input_select_box').hide()
        else
          $('.input_select_box').show()

      'event blur .input_select': (args) ->
        if args.e.currentTarget.value isnt ""
          if $('.blue_color').html()
            args.e.currentTarget.value = $('.blue_color').html()
            args.e.currentTarget.dataset.value = $('.blue_color').data('value')
          if args.e.currentTarget.dataset.value is ""
            args.e.currentTarget.value = ""
        else
          args.e.currentTarget.value = ""
          args.e.currentTarget.dataset.value = ""
        $('.input_select_box').hide()
        return

      'event mouseover .lala_item': (args) ->
        $('.lala_item').removeClass('blue_color')
        $(args.e.target).addClass('blue_color')
        b = $(args.e.target).html()
        $('.input_select').val(b)
        return

      'event click .input_select': (args) ->

        if args.e.currentTarget.value isnt ""

          $('.input_select_box').show()
              
          params = {input: args.e.currentTarget.value, field: args.e.currentTarget.dataset.database}

          subs = Meteor.subscribe "cities_list", params
            
          if pargs.session
            pargs.session.stop()

          pargs.session = subs
          return

      'event keyup .input_select': (args) ->

        if args.e.which is 40
          if $('.lala_item').hasClass("blue_color") is false
            $('.input_select_list li:first-child').addClass("blue_color")
          else
            $(".blue_color").removeClass("blue_color").next().addClass("blue_color")

          b = $(".blue_color").html()
          if b
            args.e.currentTarget.value = b
          return

        else if args.e.which is 38
          if $('.lala_item').hasClass("blue_color") is false
            $('.input_select_list li:first-child').addClass("blue_color")
          else
            $(".blue_color").removeClass("blue_color").prev().addClass("blue_color")

          b = $(".blue_color").html()
          if b
            args.e.currentTarget.value = b
          return
        else if args.e.which is 13
          if $('.lala_item').hasClass("blue_color")
            d = $(".blue_color").html()
            if d
              args.e.currentTarget.value = d
              args.e.currentTarget.dataset.value = $('.blue_color').data('value')
          $('.input_select_box').hide()
          if pargs.session
            pargs.session.stop()

        else if args.e.which is 27
          args.e.currentTarget.value = ""
          args.e.currentTarget.dataset.value = ""
          $('.input_select_box').hide()
          if pargs.session
            pargs.session.stop()

        else
          if args.e.currentTarget.value is ""
            $('.input_select_box').hide()
          else
            
            $('.input_select_box').show()

          if args.e.currentTarget.value isnt ""
              

            params = {input: args.e.currentTarget.value, field: args.e.currentTarget.dataset.database}

            subs = Meteor.subscribe "cities_list", params
              

            if pargs.session
              pargs.session.stop()

            pargs.session = subs
            return


      'event click .submit': (args) ->
        a = args.t.findAll('input, select')
        console.log a
        b = {}
        _.map a, (num) ->
          if num.localName is "input"
            if num.dataset.array is "0"
              b[num.name] = num.value
            else if num.dataset.array is "1"
              if b[num.name] is undefined
                b[num.name] = []
                b[num.name].push(num.value)
              else
                b[num.name].push(num.value)

          else if num.localName is "select"
            d = new Meteor.Collection.ObjectID(num.value)
            if num.dataset.array is "0"
              b[num.name] = d
            else if num.dataset.array is "1"
              if b[num.name] is undefined
                b[num.name] = []
                b[num.name].push(d)
              else
                b[num.name].push(d)
          b
        console.log b
        params = {human: b}

        Meteor.call 'insert_human', params, ->
          console.log "inserted"

      'event click .save_contact_json': (args) ->
        Meteor.call 'save_contact_json', ->
          console.log "json saved"

      'event click .add_contact_button_individual': (args) ->
        a = args.e.currentTarget.getAttribute('data-id')
        c = DATA.findOne({_id: _str: a}, {fields: _id: 0})
        c.input = "remove_input_individual"
        console.log c
        pargs.input.spush('individual', c)

      'event click .add_contact_button_company': (args) ->
        a = args.e.currentTarget.getAttribute('data-id')
        c = DATA.findOne({_id: _str: a}, {fields: _id: 0})
        console.log c
        c.input = "remove_input_company"
        pargs.input.spush('company', c)

      'event click .remove_input_individual': (args) ->
        index = args.e.currentTarget.getAttribute('data-index')
        pargs.input.spop('individual', index)

      'event click .remove_input_company': (args) ->
        index = args.e.currentTarget.getAttribute('data-index')
        pargs.input.spop('company', index)


      reactive_input:
        _dep: new Deps.Dependency()
        _value: {}
        get: (v) ->
          this._dep.depend()
          this._value[v]

        spush: (v, t) ->
          if this._value[v] is undefined
            this._value[v] = []
          if t.array is 1
            this._value[v].push(t)
          else
            j = 0
            k = 0
            l = 0
            _.map this._value[v], (value, key) ->
              if t.input_name
                if t.input_name is value.input_name
                  l = j
                  k = 1
                j++
              if t.select_name
                if t.select_name is value.select_name
                  l = j
                  k = 1
                j++
            if k is 0
              this._value[v].push(t)
            else
              this._value[v].splice(l, 1)
          this._value[v].map (doc, index) ->
            doc.index = index
            doc.index

          this._dep.changed()
        spop: (v, t) ->
          this._value[v].splice(t, 1)
          this._value[v].map (doc, index) ->
            doc.index = index
            doc.index
          this._dep.changed()




      destroy: (args) ->



  Sandbox:
    create: (pargs) ->

      config_router: (args) ->
        pargs.core.config_iron_router(args)
      map_router: (args) ->
        pargs.core.map_iron_router(args)
      map_event: (args) ->
        pargs.core.meteor_event_map(args)
      map_helpers: (args) ->
        pargs.core.meteor_helpers(args)
      mcall: (args) ->
        pargs.core.meteor_call(args)
      subscribe: (args) ->
        pargs.core.meteor_subscribe(args)
      init: (args) ->
        pargs.core.init_seperator(args)
      routing: (args) ->
        pargs.core.routing(args)
      login: (args) ->
        pargs.core.meteor_login(args)
      logout: (args) ->
        pargs.core.meteor_logout(args)
      session_get: (args) ->
        pargs.core.meteor_session_get(args)
      session_set: (args) ->
        pargs.core.meteor_session_set(args)
      create_account: (args) ->
        pargs.core.meteor_create_account(args)
      empty_child: (args) ->
        pargs.core.jquery_empty(args)
      autorun: (args) ->
        pargs.core.meteor_deps_autorun(args)
      user: (args) ->
        pargs.core.meteor_user(args)
      get_child: (args) ->
        pargs.core.jquery_children(args)
      set_attr: (args) ->
        pargs.core.jquery_attr(args)



  Core:
    activate_module: (args) ->
      if typeof args.mod is 'function' and typeof args.sb is 'function'
        core =
          core: this
        sb =
          sb: args.sb(core)
        k = args.mod sb
        if k.init and typeof k.init is 'function'
          params = module: k
          @start params
        else
          console.log "Module'#{args.mod}' Registration : FAILED : instance has no init or destroy functions"
      else
        console.log "Module'#{args.mod}' Registration : FAILED : one or more argument are of incorrect type"

    start: (args) ->
      if args
        args.module.init()

    start_all: (args) ->
      _.map args.mod, (mod) =>
        params =
          mod: mod
          sb: args.sb
        @activate_module(params)

    config_iron_router: (args) ->
     
      Router.configure
        layoutTemplate: args.template
        before: ->
          if Meteor.user() is null
            this.render('login')
            this.stop()

    map_iron_router: (args) ->
      _.map args.routes, (routes) ->
        Router.map ->
          this.route routes.route_name,
            path: routes.route_path
            action: ->
              if routes.route_actions
                params =
                  route_this: this
                routes.route_actions(params)

    meteor_event_map: (args) ->
      _.map args.events, (ev) ->
        console.log ev
        a = "#{ev.event_name} #{ev.event_element}"
        d = {}
        d[a] = (e, t) ->
          params =
            e: e
            t: t
            this: this
          ev.event_actions(params)
        Template[args.template].events(d)
        
    meteor_helpers: (args) ->
      _.map args.helpers, (helper) ->
        Template[args.template][helper.helper_name] = (arg, options) ->
          params =
            spacebar_arg: arg
            spacebar_option: options
          helper.helper_actions(params)
        Template[args.template][helper.helper_name]

    meteor_call: (args) ->
      _.map args.mcall, (mcall) ->
        Meteor.call mcall.mcall_name, (err, res) ->
          params =
            res: res
          mcall.mcall_actions(params)

    meteor_subscribe: (args) ->
      _.map args.subscribe, (subscribe) ->
        Meteor.subscribe subscribe.subscribe_name, [], ->
          subscribe.subscribe_actions()

    init_seperator: (args) ->
      params = {}
      params.events = {}
      params.helpers = {}
      params.routes = {}
      params.mcall = {}
      params.subscribe = {}
      params.events.template = args._template
      params.helpers.template = args._template
      params.routes.template = args._template
      params.events.events = []
      params.helpers.helpers = []
      params.routes.routes = []
      params.mcall.mcall = []
      params.subscribe.subscribe = []
      a = _.keys(args)
      events = _.filter a, (keys) ->
        keys.indexOf('event') is 0
      helpers = _.filter a, (keys) ->
        keys.indexOf('helper') is 0
      routes = _.filter a, (keys) ->
        keys.indexOf('route') is 0
      mcall = _.filter a, (keys) ->
        keys.indexOf('mcall') is 0
      subscribe = _.filter a, (keys) ->
        keys.indexOf('subscribe') is 0
      eventsa = _.pick(args, events)
      helpersa = _.pick(args, helpers)
      routesa = _.pick(args, routes)
      mcalla = _.pick(args, mcall)
      subscribea = _.pick(args, subscribe)
      i = 0
      _.map eventsa, (value, key) ->
        j = key.split(" ")
        params.events.events[i] = {event_name: j[1], event_element: j[2], event_actions: value}
        i++
      k = 0
      _.map helpersa, (value, key) ->
        j = key.split(" ")
        params.helpers.helpers[k] = {helper_name: j[1], helper_actions: value}
        k++
      l = 0
      _.map routesa, (value, key) ->
        j = key.split(" ")
        params.routes.routes[l] = {route_name: j[1], route_path: j[2], route_actions: value}
        l++
      _.map mcalla, (value, key) ->
        j = key.split(" ")
        params.mcall.mcall[l] = {mcall_name: j[1], mcall_actions: value}
        l++
      _.map subscribea, (value, key) ->
        j = key.split(" ")
        params.subscribe.subscribe[l] = {subscribe_name: j[1], subscribe_actions: value}
        l++
      params

    routing: (args) ->
      if args.route_params
        if document.getElementById("child") isnt null
          if Meteor.user() isnt null

            b = args.route_params.split('-')
            
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

    meteor_login: (args) ->

      Meteor.loginWithPassword(args.username, args.password)

    meteor_logout: (args) ->

      Meteor.logout()

    meteor_session_get: (args) ->

      Session.get(args.p)

    meteor_session_set: (args) ->

      Session.set(args.p, args.v)

    meteor_create_account: (args) ->

      Accounts.createUser
        username: args.username
        password: args.password
        email: args.email
        profile:
          name: args.name

    meteor_deps_autorun: (args) ->
      console.log args
      Deps.autorun ->
        args.actions()

    meteor_user: (args) ->
      
      Meteor.user()

    jquery_empty: (args) ->

      $(args.element).empty()

    jquery_children: (args) ->
      if args.p and args.c
        a = $(args.p).children(args.c)
      else if args.p
        a = $(args.p).children()
      else if args.c
        children(args.c)
      a

    jquery_attr: (args) ->
      if args.p and args.a and args.v
        a = $(args.p).attr(args.a, args.v)
      else if args.a and args.v
        attr(args.a, args.v)
      a

α = new ALPHA()

Template.select_list.rendered = ->
  if $('.lala_item').hasClass("blue_color") is false
    $('.input_select_list li:first-child').addClass("blue_color")
Template.select_list.destroyed = ->
  if $('.lala_item').hasClass("blue_color") is false
    $('.input_select_list li:first-child').addClass("blue_color")

α.Core.start_all(sb: α.Sandbox.create, mod: α.Module)



      