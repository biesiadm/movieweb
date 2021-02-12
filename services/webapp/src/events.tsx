import EventEmitter from 'eventemitter3';

const Emitter = new EventEmitter();

enum UserEvent {
  LogIn = "LOGIN",
  LogOut = "LOGOUT"
}

export { Emitter, UserEvent };
