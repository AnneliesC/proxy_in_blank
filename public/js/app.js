(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var connect_button = document.getElementsByTagName("cosmic-race-qr-code")[0];
//var you = document.querySelector("#you");
var stranger = document.querySelector("#stranger");

// you.addEventListener("playingstream", (function(e){
// connect_button.connect(e.detail.stream);
// }).bind(this));

connect_button.addEventListener("connected", (function(e){
	//you.label = "you: " + e.currentTarget.peerId;
}).bind(this));

connect_button.addEventListener("strangerfound", (function(e){
	stranger.stream = e.detail.stream;
}).bind(this));

connect_button.addEventListener("strangerleft", (function(e){
	stranger.removeStream();
}).bind(this));

},{}]},{},[1]);
