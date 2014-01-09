var ALPHA, α;

ALPHA = (function() {
  function ALPHA() {}

  ALPHA.prototype.Module = {
    config: function(pargs) {
      return {
        _template: 'layout',
        init: function(args) {
          return pargs.sb.config_router({
            template: this._template
          });
        },
        destroy: function(args) {}
      };
    },
    layout: function(pargs) {
      return {
        _template: 'layout',
        init: function(args) {
          var a;
          a = pargs.sb.init(this);
          return pargs.sb.map_event(a.events);
        },
        'event click #logout': function(args) {
          return pargs.sb.logout();
        },
        destroy: function(args) {}
      };
    },
    home: function(pargs) {
      return {
        init: function(args) {
          var a;
          a = pargs.sb.init(this);
          return pargs.sb.map_router(a.routes);
        },
        'route home /': function(args) {},
        destroy: function(args) {}
      };
    },
    login: function(pargs) {
      return {
        _template: 'login',
        init: function(args) {
          var a;
          a = pargs.sb.init(this);
          pargs.sb.map_event(a.events);
          return pargs.sb.map_helpers(a.helpers);
        },
        'helper creatingAccount': function(args) {
          return pargs.sb.session_get({
            p: "creatingAccount"
          });
        },
        'event click #loginform': function(args) {
          return pargs.sb.session_set({
            p: 'creatingAccount',
            v: false
          });
        },
        'event click #accountform': function(args) {
          return pargs.sb.session_set({
            p: 'creatingAccount',
            v: true
          });
        },
        'event click #createaccount': function(args) {
          var params;
          pargs.sb.session_set({
            p: 'creatingAccount',
            v: false
          });
          params = {
            username: args.t.find('#username').value,
            password: args.t.find('#password').value,
            email: args.t.find('#email').value,
            name: args.t.find('#name').value
          };
          return pargs.sb.create_account(params);
        },
        'event click #login': function(args) {
          var params;
          params = {
            username: args.t.find('#username').value,
            password: args.t.find('#password').value
          };
          return pargs.sb.login(params);
        },
        'event click #logout': function(args) {
          return pargs.sb.logout();
        },
        destroy: function(args) {}
      };
    },
    module_test: function(pargs) {
      return {
        _template: 'moduleTest',
        init: function(args) {
          var a;
          a = pargs.sb.init(this);
          pargs.sb.map_router(a.routes);
          pargs.sb.map_event(a.events);
          pargs.sb.map_helpers(a.helpers);
          return pargs.sb.autorun({
            actions: this.autorun
          });
        },
        autorun: function(args) {
          var h, j;
          h = pargs.sb.session_get({
            p: "moduleTest-rr"
          });
          if (document.getElementById("child") !== null) {
            if (pargs.sb.user() !== null) {
              j = 0;
              return pargs.sb.get_child({
                p: '#child'
              }).map(function() {
                var k;
                k = pargs.sb.get_child({
                  p: this,
                  c: '.close'
                });
                pargs.sb.set_attr({
                  p: k,
                  a: 'href',
                  v: "" + j
                });
                return j++;
              });
            }
          }
        },
        'helper route': function(args) {
          var a, d, h;
          h = pargs.sb.session_get({
            p: "moduleTest-rr"
          });
          if (h) {
            d = h.split("/");
            if (d[2] === void 0) {
              a = "" + h + "/" + args.spacebar_arg;
            } else {
              if (d[2].length === 0) {
                a = "" + h + args.spacebar_arg;
              } else {
                a = "" + h + "-" + args.spacebar_arg;
              }
            }
            return a;
          }
        },
        'route moduletest moduletest/:ll': function(args) {
          var params;
          pargs.sb.session_set({
            p: "moduleTest-rr",
            v: Router.current().path
          });
          args.route_this.render('moduleTest');
          params = {
            route_params: args.route_this.params.ll
          };
          return pargs.sb.routing(params);
        },
        'route moduletest moduletest': function(args) {
          pargs.sb.session_set({
            p: "moduleTest-rr",
            v: Router.current().path
          });
          args.route_this.render('moduleTest');
          return pargs.sb.empty_child({
            element: '#child'
          });
        },
        'event click .click': function(args) {
          args.e.currentTarget.innerHTML = "hello";
          return args.e.currentTarget;
        },
        destroy: function(args) {}
      };
    },
    post_lists: function(pargs) {
      return {
        _template: 'postlists',
        init: function(args) {
          var a;
          a = pargs.sb.init(this);
          pargs.sb.map_helpers(a.helpers);
          pargs.post = {
            _dep: new Deps.Dependency(),
            _value: [Template.an],
            get: function() {
              this._dep.depend();
              return this._value;
            },
            spush: function(t) {
              this._value.push(t);
              return this._dep.changed();
            }
          };
          return pargs.post;
        },
        'helper posts': function(args) {
          return pargs.post.get();
        }
      };
    },
    add_contact: function(pargs) {
      return {
        _template: 'add_contact',
        init: function(args) {
          var a;
          a = pargs.sb.init(this);
          pargs.input = this.reactive_input;
          pargs.session = false;
          if (a.routes) {
            pargs.sb.map_router(a.routes);
          }
          if (a.helpers) {
            pargs.sb.map_helpers(a.helpers);
          }
          if (a.events) {
            pargs.sb.map_event(a.events);
          }
          if (a.mcall) {
            pargs.sb.mcall(a.mcall);
          }
          if (a.subscribe) {
            return pargs.sb.subscribe(a.subscribe);
          }
        },
        'subscribe list': function(args) {
          var b, c, d;
          console.log("lists subscribed");
          b = DATA.findOne({
            select_name: "initials"
          }, {
            fields: {
              _id: 0
            }
          });
          c = DATA.findOne({
            input_name: "first_name"
          }, {
            fields: {
              _id: 0
            }
          });
          d = DATA.findOne({
            input_name: "company_name"
          }, {
            fields: {
              _id: 0
            }
          });
          if (b) {
            pargs.input.spush('individual', b);
          }
          if (c) {
            pargs.input.spush('individual', c);
          }
          if (d) {
            return pargs.input.spush('company', d);
          }
        },
        'subscribe countries_list': function(args) {
          return console.log("countries subscribed");
        },
        'route add_contact add_contact/:ll': function(args) {},
        'route add_contact add_contact': function(args) {
          return args.route_this.render('add_contact');
        },
        'helper company': function(args) {
          return pargs.sb.session_get({
            p: "company"
          });
        },
        'helper buttons_individual': function(args) {
          var a;
          a = DATA.findOne({
            name: "contact_button_list"
          });
          if (a) {
            return DATA.find({
              $and: [
                {
                  type: a._id,
                  individual: {
                    $ne: 2
                  },
                  input_starting: {
                    $ne: 1
                  },
                  select_starting: {
                    $ne: 1
                  }
                }
              ]
            });
          }
        },
        'helper buttons_company': function(args) {
          var a;
          a = DATA.findOne({
            name: "contact_button_list"
          });
          if (a) {
            return DATA.find({
              $and: [
                {
                  type: a._id,
                  individual: {
                    $ne: 1
                  },
                  input_starting: {
                    $ne: 1
                  },
                  select_starting: {
                    $ne: 1
                  }
                }
              ]
            });
          }
        },
        'helper countries': function(args) {
          if (args.spacebar_arg) {
            console.log(args.spacebar_arg);
            return DATA.find({
              type: {
                _str: args.spacebar_arg
              }
            });
          }
        },
        'helper input_select': function(args) {
          console.log(args.spacebar_arg);
          return DATA.find({
            type: {
              _str: args.spacebar_arg
            }
          });
        },
        'helper input_company': function(args) {
          return pargs.input.get('company');
        },
        'helper input_individual': function(args) {
          var a;
          a = pargs.input.get('individual');
          console.log(a);
          return a;
        },
        'event click .individual': function(args) {
          return pargs.sb.session_set({
            p: 'company',
            v: false
          });
        },
        'event click .company': function(args) {
          return pargs.sb.session_set({
            p: 'company',
            v: true
          });
        },
        'event focus .input_select': function(args) {
          if (args.e.currentTarget.value === "") {
            return $('.input_select_box').hide();
          } else {
            return $('.input_select_box').show();
          }
        },
        'event blur .input_select': function(args) {
          if (args.e.currentTarget.value !== "") {
            if ($('.blue_color').html()) {
              args.e.currentTarget.value = $('.blue_color').html();
              args.e.currentTarget.dataset.value = $('.blue_color').data('value');
            }
            if (args.e.currentTarget.dataset.value === "") {
              args.e.currentTarget.value = "";
            }
          } else {
            args.e.currentTarget.value = "";
            args.e.currentTarget.dataset.value = "";
          }
          $('.input_select_box').hide();
        },
        'event mouseover .lala_item': function(args) {
          var b;
          $('.lala_item').removeClass('blue_color');
          $(args.e.target).addClass('blue_color');
          b = $(args.e.target).html();
          $('.input_select').val(b);
        },
        'event click .input_select': function(args) {
          var params, subs;
          if (args.e.currentTarget.value !== "") {
            $('.input_select_box').show();
            params = {
              input: args.e.currentTarget.value,
              field: args.e.currentTarget.dataset.database
            };
            subs = Meteor.subscribe("cities_list", params);
            if (pargs.session) {
              pargs.session.stop();
            }
            pargs.session = subs;
          }
        },
        'event keyup .input_select': function(args) {
          var b, d, params, subs;
          if (args.e.which === 40) {
            if ($('.lala_item').hasClass("blue_color") === false) {
              $('.input_select_list li:first-child').addClass("blue_color");
            } else {
              $(".blue_color").removeClass("blue_color").next().addClass("blue_color");
            }
            b = $(".blue_color").html();
            if (b) {
              args.e.currentTarget.value = b;
            }
          } else if (args.e.which === 38) {
            if ($('.lala_item').hasClass("blue_color") === false) {
              $('.input_select_list li:first-child').addClass("blue_color");
            } else {
              $(".blue_color").removeClass("blue_color").prev().addClass("blue_color");
            }
            b = $(".blue_color").html();
            if (b) {
              args.e.currentTarget.value = b;
            }
          } else if (args.e.which === 13) {
            if ($('.lala_item').hasClass("blue_color")) {
              d = $(".blue_color").html();
              if (d) {
                args.e.currentTarget.value = d;
                args.e.currentTarget.dataset.value = $('.blue_color').data('value');
              }
            }
            $('.input_select_box').hide();
            if (pargs.session) {
              return pargs.session.stop();
            }
          } else if (args.e.which === 27) {
            args.e.currentTarget.value = "";
            args.e.currentTarget.dataset.value = "";
            $('.input_select_box').hide();
            if (pargs.session) {
              return pargs.session.stop();
            }
          } else {
            if (args.e.currentTarget.value === "") {
              $('.input_select_box').hide();
            } else {
              $('.input_select_box').show();
            }
            if (args.e.currentTarget.value !== "") {
              params = {
                input: args.e.currentTarget.value,
                field: args.e.currentTarget.dataset.database
              };
              subs = Meteor.subscribe("cities_list", params);
              if (pargs.session) {
                pargs.session.stop();
              }
              pargs.session = subs;
            }
          }
        },
        'event click .submit': function(args) {
          var a, b, params;
          a = args.t.findAll('input, select');
          console.log(a);
          b = {};
          _.map(a, function(num) {
            var d;
            if (num.localName === "input") {
              if (num.dataset.array === "0") {
                b[num.name] = num.value;
              } else if (num.dataset.array === "1") {
                if (b[num.name] === void 0) {
                  b[num.name] = [];
                  b[num.name].push(num.value);
                } else {
                  b[num.name].push(num.value);
                }
              }
            } else if (num.localName === "select") {
              d = new Meteor.Collection.ObjectID(num.value);
              if (num.dataset.array === "0") {
                b[num.name] = d;
              } else if (num.dataset.array === "1") {
                if (b[num.name] === void 0) {
                  b[num.name] = [];
                  b[num.name].push(d);
                } else {
                  b[num.name].push(d);
                }
              }
            }
            return b;
          });
          console.log(b);
          params = {
            human: b
          };
          return Meteor.call('insert_human', params, function() {
            return console.log("inserted");
          });
        },
        'event click .save_contact_json': function(args) {
          return Meteor.call('save_contact_json', function() {
            return console.log("json saved");
          });
        },
        'event click .add_contact_button_individual': function(args) {
          var a, c;
          a = args.e.currentTarget.getAttribute('data-id');
          c = DATA.findOne({
            _id: {
              _str: a
            }
          }, {
            fields: {
              _id: 0
            }
          });
          c.input = "remove_input_individual";
          console.log(c);
          return pargs.input.spush('individual', c);
        },
        'event click .add_contact_button_company': function(args) {
          var a, c;
          a = args.e.currentTarget.getAttribute('data-id');
          c = DATA.findOne({
            _id: {
              _str: a
            }
          }, {
            fields: {
              _id: 0
            }
          });
          console.log(c);
          c.input = "remove_input_company";
          return pargs.input.spush('company', c);
        },
        'event click .remove_input_individual': function(args) {
          var index;
          index = args.e.currentTarget.getAttribute('data-index');
          return pargs.input.spop('individual', index);
        },
        'event click .remove_input_company': function(args) {
          var index;
          index = args.e.currentTarget.getAttribute('data-index');
          return pargs.input.spop('company', index);
        },
        reactive_input: {
          _dep: new Deps.Dependency(),
          _value: {},
          get: function(v) {
            this._dep.depend();
            return this._value[v];
          },
          spush: function(v, t) {
            var j, k, l;
            if (this._value[v] === void 0) {
              this._value[v] = [];
            }
            if (t.array === 1) {
              this._value[v].push(t);
            } else {
              j = 0;
              k = 0;
              l = 0;
              _.map(this._value[v], function(value, key) {
                if (t.input_name) {
                  if (t.input_name === value.input_name) {
                    l = j;
                    k = 1;
                  }
                  j++;
                }
                if (t.select_name) {
                  if (t.select_name === value.select_name) {
                    l = j;
                    k = 1;
                  }
                  return j++;
                }
              });
              if (k === 0) {
                this._value[v].push(t);
              } else {
                this._value[v].splice(l, 1);
              }
            }
            this._value[v].map(function(doc, index) {
              doc.index = index;
              return doc.index;
            });
            return this._dep.changed();
          },
          spop: function(v, t) {
            this._value[v].splice(t, 1);
            this._value[v].map(function(doc, index) {
              doc.index = index;
              return doc.index;
            });
            return this._dep.changed();
          }
        },
        destroy: function(args) {}
      };
    }
  };

  ALPHA.prototype.Sandbox = {
    create: function(pargs) {
      return {
        config_router: function(args) {
          return pargs.core.config_iron_router(args);
        },
        map_router: function(args) {
          return pargs.core.map_iron_router(args);
        },
        map_event: function(args) {
          return pargs.core.meteor_event_map(args);
        },
        map_helpers: function(args) {
          return pargs.core.meteor_helpers(args);
        },
        mcall: function(args) {
          return pargs.core.meteor_call(args);
        },
        subscribe: function(args) {
          return pargs.core.meteor_subscribe(args);
        },
        init: function(args) {
          return pargs.core.init_seperator(args);
        },
        routing: function(args) {
          return pargs.core.routing(args);
        },
        login: function(args) {
          return pargs.core.meteor_login(args);
        },
        logout: function(args) {
          return pargs.core.meteor_logout(args);
        },
        session_get: function(args) {
          return pargs.core.meteor_session_get(args);
        },
        session_set: function(args) {
          return pargs.core.meteor_session_set(args);
        },
        create_account: function(args) {
          return pargs.core.meteor_create_account(args);
        },
        empty_child: function(args) {
          return pargs.core.jquery_empty(args);
        },
        autorun: function(args) {
          return pargs.core.meteor_deps_autorun(args);
        },
        user: function(args) {
          return pargs.core.meteor_user(args);
        },
        get_child: function(args) {
          return pargs.core.jquery_children(args);
        },
        set_attr: function(args) {
          return pargs.core.jquery_attr(args);
        }
      };
    }
  };

  ALPHA.prototype.Core = {
    activate_module: function(args) {
      var core, k, params, sb;
      if (typeof args.mod === 'function' && typeof args.sb === 'function') {
        core = {
          core: this
        };
        sb = {
          sb: args.sb(core)
        };
        k = args.mod(sb);
        if (k.init && typeof k.init === 'function') {
          params = {
            module: k
          };
          return this.start(params);
        } else {
          return console.log("Module'" + args.mod + "' Registration : FAILED : instance has no init or destroy functions");
        }
      } else {
        return console.log("Module'" + args.mod + "' Registration : FAILED : one or more argument are of incorrect type");
      }
    },
    start: function(args) {
      if (args) {
        return args.module.init();
      }
    },
    start_all: function(args) {
      var _this = this;
      return _.map(args.mod, function(mod) {
        var params;
        params = {
          mod: mod,
          sb: args.sb
        };
        return _this.activate_module(params);
      });
    },
    config_iron_router: function(args) {
      return Router.configure({
        layoutTemplate: args.template,
        before: function() {
          if (Meteor.user() === null) {
            this.render('login');
            return this.stop();
          }
        }
      });
    },
    map_iron_router: function(args) {
      return _.map(args.routes, function(routes) {
        return Router.map(function() {
          return this.route(routes.route_name, {
            path: routes.route_path,
            action: function() {
              var params;
              if (routes.route_actions) {
                params = {
                  route_this: this
                };
                return routes.route_actions(params);
              }
            }
          });
        });
      });
    },
    meteor_event_map: function(args) {
      return _.map(args.events, function(ev) {
        var a, d;
        console.log(ev);
        a = "" + ev.event_name + " " + ev.event_element;
        d = {};
        d[a] = function(e, t) {
          var params;
          params = {
            e: e,
            t: t,
            "this": this
          };
          return ev.event_actions(params);
        };
        return Template[args.template].events(d);
      });
    },
    meteor_helpers: function(args) {
      return _.map(args.helpers, function(helper) {
        Template[args.template][helper.helper_name] = function(arg, options) {
          var params;
          params = {
            spacebar_arg: arg,
            spacebar_option: options
          };
          return helper.helper_actions(params);
        };
        return Template[args.template][helper.helper_name];
      });
    },
    meteor_call: function(args) {
      return _.map(args.mcall, function(mcall) {
        return Meteor.call(mcall.mcall_name, function(err, res) {
          var params;
          params = {
            res: res
          };
          return mcall.mcall_actions(params);
        });
      });
    },
    meteor_subscribe: function(args) {
      return _.map(args.subscribe, function(subscribe) {
        return Meteor.subscribe(subscribe.subscribe_name, [], function() {
          return subscribe.subscribe_actions();
        });
      });
    },
    init_seperator: function(args) {
      var a, events, eventsa, helpers, helpersa, i, k, l, mcall, mcalla, params, routes, routesa, subscribe, subscribea;
      params = {};
      params.events = {};
      params.helpers = {};
      params.routes = {};
      params.mcall = {};
      params.subscribe = {};
      params.events.template = args._template;
      params.helpers.template = args._template;
      params.routes.template = args._template;
      params.events.events = [];
      params.helpers.helpers = [];
      params.routes.routes = [];
      params.mcall.mcall = [];
      params.subscribe.subscribe = [];
      a = _.keys(args);
      events = _.filter(a, function(keys) {
        return keys.indexOf('event') === 0;
      });
      helpers = _.filter(a, function(keys) {
        return keys.indexOf('helper') === 0;
      });
      routes = _.filter(a, function(keys) {
        return keys.indexOf('route') === 0;
      });
      mcall = _.filter(a, function(keys) {
        return keys.indexOf('mcall') === 0;
      });
      subscribe = _.filter(a, function(keys) {
        return keys.indexOf('subscribe') === 0;
      });
      eventsa = _.pick(args, events);
      helpersa = _.pick(args, helpers);
      routesa = _.pick(args, routes);
      mcalla = _.pick(args, mcall);
      subscribea = _.pick(args, subscribe);
      i = 0;
      _.map(eventsa, function(value, key) {
        var j;
        j = key.split(" ");
        params.events.events[i] = {
          event_name: j[1],
          event_element: j[2],
          event_actions: value
        };
        return i++;
      });
      k = 0;
      _.map(helpersa, function(value, key) {
        var j;
        j = key.split(" ");
        params.helpers.helpers[k] = {
          helper_name: j[1],
          helper_actions: value
        };
        return k++;
      });
      l = 0;
      _.map(routesa, function(value, key) {
        var j;
        j = key.split(" ");
        params.routes.routes[l] = {
          route_name: j[1],
          route_path: j[2],
          route_actions: value
        };
        return l++;
      });
      _.map(mcalla, function(value, key) {
        var j;
        j = key.split(" ");
        params.mcall.mcall[l] = {
          mcall_name: j[1],
          mcall_actions: value
        };
        return l++;
      });
      _.map(subscribea, function(value, key) {
        var j;
        j = key.split(" ");
        params.subscribe.subscribe[l] = {
          subscribe_name: j[1],
          subscribe_actions: value
        };
        return l++;
      });
      return params;
    },
    routing: function(args) {
      var b, c, j;
      if (args.route_params) {
        if (document.getElementById("child") !== null) {
          if (Meteor.user() !== null) {
            b = args.route_params.split('-');
            c = $('#child').children().map(function() {
              return $(this).attr('class');
            });
            j = 0;
            while (c.length > b.length) {
              $("#child div:last-child").remove();
              c.splice(-1, 1);
            }
            _.map(b, function(num) {
              if (c === void 0) {
                if (Template[num]) {
                  return UI.materialize(Template[num], document.getElementById("child"));
                }
              } else {
                if (!c[j]) {
                  if (Template[num]) {
                    UI.materialize(Template[num], document.getElementById("child"));
                  }
                }
                return j++;
              }
            });
          }
        }
      }
      return Session.set("moduleTest-rr", Router.current().path);
    },
    meteor_login: function(args) {
      return Meteor.loginWithPassword(args.username, args.password);
    },
    meteor_logout: function(args) {
      return Meteor.logout();
    },
    meteor_session_get: function(args) {
      return Session.get(args.p);
    },
    meteor_session_set: function(args) {
      return Session.set(args.p, args.v);
    },
    meteor_create_account: function(args) {
      return Accounts.createUser({
        username: args.username,
        password: args.password,
        email: args.email,
        profile: {
          name: args.name
        }
      });
    },
    meteor_deps_autorun: function(args) {
      console.log(args);
      return Deps.autorun(function() {
        return args.actions();
      });
    },
    meteor_user: function(args) {
      return Meteor.user();
    },
    jquery_empty: function(args) {
      return $(args.element).empty();
    },
    jquery_children: function(args) {
      var a;
      if (args.p && args.c) {
        a = $(args.p).children(args.c);
      } else if (args.p) {
        a = $(args.p).children();
      } else if (args.c) {
        children(args.c);
      }
      return a;
    },
    jquery_attr: function(args) {
      var a;
      if (args.p && args.a && args.v) {
        a = $(args.p).attr(args.a, args.v);
      } else if (args.a && args.v) {
        attr(args.a, args.v);
      }
      return a;
    }
  };

  return ALPHA;

})();

α = new ALPHA();

Template.select_list.rendered = function() {
  if ($('.lala_item').hasClass("blue_color") === false) {
    return $('.input_select_list li:first-child').addClass("blue_color");
  }
};

Template.select_list.destroyed = function() {
  if ($('.lala_item').hasClass("blue_color") === false) {
    return $('.input_select_list li:first-child').addClass("blue_color");
  }
};

α.Core.start_all({
  sb: α.Sandbox.create,
  mod: α.Module
});
