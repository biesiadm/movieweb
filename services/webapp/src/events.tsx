import EventEmitter from 'eventemitter3';

const Emitter = new EventEmitter();

enum Event {
  LogIn = "LOGIN",
  LogOut = "LOGOUT",
  Follow = "FOLLOW",
  Unfollow = "UNFOLLOW"
}

export { Emitter, Event };
