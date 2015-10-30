'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');
var ReactDOM = require('react-dom');
var Flux = require('flux');
var screenfull = require('screenfull');
var update = require('react-addons-update');
var cx = require('classnames');

var dispatcher = new Flux.Dispatcher();

var STATE_IDLE = 0,
    STATE_BEGINNING = 1,
    STATE_PLAYING = 2,
    STATE_WIN = 3,
    STATE_LOSE = 4;

var App = React.createClass({
	displayName: 'App',

	render: function render() {
		var loaded = this.state.loaded;
		return React.createElement(
			'div',
			null,
			React.createElement(App.Audio, { ref: 'audio' }),
			React.createElement(App.Content, _extends({ ref: 'content' }, this.state)),
			React.createElement(App.Overlay, _extends({ ref: 'overlay' }, this.state)),
			React.createElement(App.LoadingScreen, { loaded: loaded })
		);
	},
	getInitialState: function getInitialState() {
		return { loaded: true, step: '', endstate: '', showInner: false, showScreamNow: false, showCredit: false };
	},
	componentDidMount: function componentDidMount() {
		this.listenerID = dispatcher.register((function (payload) {
			switch (payload.type) {
				case 'goto':
					this.setState({ step: payload.step, endstate: payload.endstate ? payload.endstate : '' });
					break;
				case 'restart':
					this.restart();
					break;
				case 'videoLoaded':
					this.setState({ loaded: true });
					break;
				case 'showScreamNow':
					this.setState({ showScreamNow: true });
					break;
				case 'hideScreamNow':
					this.setState({ showScreamNow: false });
					break;
				case 'showCredits':
					this.setState({ showCredits: true });
					break;
				case 'hideCredits':
					this.setState({ showCredits: false });
					break;
			}
		}).bind(this));

		window.setTimeout((function () {
			this.setState({ step: 'mainpage' });
		}).bind(this), 1000);

		window.setTimeout((function () {
			this.setState({ showInner: true });
		}).bind(this), 2000);
	},
	componentWillUnmount: function componentWillUnmount() {
		dispatcher.unregister(this.listenerID);
	}
});

App.Audio = React.createClass({
	displayName: 'Audio',

	render: function render() {
		return React.createElement(
			'audio',
			{ autoPlay: true, loop: true },
			React.createElement('source', { src: 'audio.ogg', type: 'audio/ogg' }),
			React.createElement('source', { src: 'audio.mp3', type: 'audio/mpeg' }),
			React.createElement('source', { src: 'audio.wav', type: 'audio/wave' }),
			React.createElement('source', { src: 'audio.wav', type: 'audio/x-wav' }),
			React.createElement('source', { src: 'audio.flac', type: 'audio/flac' })
		);
	}
});

App.Content = React.createClass({
	displayName: 'Content',

	render: function render() {
		return React.createElement(
			'div',
			{ style: this.styles.container },
			React.createElement(App.Content.Background, this.props),
			React.createElement(App.Content.MainPage, this.props),
			React.createElement(App.Content.Fade1, this.props),
			React.createElement(App.Content.Instruction, this.props),
			React.createElement(App.Content.Fade2, this.props),
			React.createElement(App.Content.Game, this.props),
			React.createElement(App.Content.Fade3, this.props),
			React.createElement(App.Content.End, this.props)
		);
	},
	styles: {
		container: {
			position: 'absolute',
			width: '100%',
			height: '100%'
		},
		inner: {
			position: 'absolute',
			width: '100%',
			height: '100%'
		}
	}
});

App.Content.Background = React.createClass({
	displayName: 'Background',

	render: function render() {
		return React.createElement('div', { style: m(this.styles.container, this.props.step == 'mainpage' && this.styles.show) });
	},
	styles: {
		container: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			transition: 'opacity 1s',
			WebkitTransition: 'opacity 1s',
			MozTransition: 'opacity 1s',
			OTransition: 'opacity 1s',
			background: 'url(home.jpg) center / cover',
			opacity: 0
		},
		show: {
			opacity: 1
		}
	}
});

App.Content.MainPage = React.createClass({
	displayName: 'MainPage',

	render: function render() {
		var showInner = this.props.showInner;
		return React.createElement(
			'div',
			{ style: m(this.styles.container, this.props.step == 'mainpage' && this.styles.show) },
			React.createElement(
				'div',
				{ className: 'valign-container', style: m(this.styles.inner, this.styles.top, showInner && this.styles.showInner) },
				React.createElement(
					'div',
					{ className: 'valign-top text-center' },
					React.createElement(
						'h5',
						{ style: this.styles.harpersbazaar },
						'HARPER\'S BAZAAR'
					),
					React.createElement(
						'h5',
						null,
						'Presents'
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'valign-container', style: m(this.styles.inner, this.styles.mid, showInner && this.styles.showInner) },
				React.createElement(
					'div',
					{ className: 'valign text-center' },
					React.createElement('img', { src: 'images/title.png', style: this.styles.image }),
					React.createElement(
						'h2',
						{ style: this.styles.subtitle },
						'An Interactive Film by Kissinger Twins'
					),
					React.createElement('button', { className: 'btn-start', style: this.styles.start, onClick: this.handleStart })
				)
			),
			React.createElement(
				'div',
				{ className: 'valign-container no-pointer-events', style: m(this.styles.inner, this.styles.bottom, showInner && this.styles.showInner) },
				React.createElement(
					'div',
					{ className: 'valign-bottom text-center' },
					React.createElement(
						'h6',
						{ className: 'font-medium' },
						'Created by BBH Asia Pacific'
					),
					React.createElement(
						'h6',
						{ className: 'font-medium' },
						'Produced by BSL'
					)
				)
			)
		);
	},
	styles: {
		container: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			transition: 'opacity 1s',
			WebkitTransition: 'opacity 1s',
			MozTransition: 'opacity 1s',
			OTransition: 'opacity 1s',
			opacity: 0,
			pointerEvents: 'none'
		},
		inner: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			opacity: 0,
			transition: 'opacity 2s',
			WebkitTransition: 'opacity 2s',
			MozTransition: 'opacity 2s',
			OTransition: 'opacity 2s'
		},
		show: {
			opacity: 1,
			pointerEvents: 'auto'
		},
		showInner: {
			opacity: 1
		},
		harpersbazaar: {
			fontFamily: 'Didot',
			fontSize: '1.25rem'
		},
		image: {
			width: '80%'
		},
		title: {
			fontFamily: 'NeoNoire',
			fontSize: '6.4vw'
		},
		subtitle: {
			fontFamily: 'Avenir UltraLight',
			fontSize: '2.2vw',
			fontWeight: 100,
			paddingTop: '10px'
		},
		top: {
			paddingTop: '20px'
		},
		mid: {
			marginTop: '32px'
		},
		bottom: {
			paddingBottom: '16px'
		},
		start: {
			width: '4rem',
			height: '4rem',
			marginTop: '40px',
			marginTop: '2.5rem',
			cursor: 'pointer'
		}
	},
	getInitialState: function getInitialState() {
		return { hoverStart: false };
	},
	handleStart: function handleStart(event) {
		event.preventDefault();
		dispatcher.dispatch({ type: 'goto', step: 'fade1' });
	}
});

App.Content.Fade1 = React.createClass({
	displayName: 'Fade1',

	render: function render() {
		return React.createElement('div', { style: m(this.styles.container, this.props.step == 'fade1' && this.styles.show) });
	},
	styles: {
		container: {
			background: 'black',
			opacity: 0,
			transition: 'opacity 1s',
			WebkitTransition: 'opacity 1s',
			MozTransition: 'opacity 1s',
			OTransition: 'opacity 1s'
		},
		show: {
			opacity: 1
		}
	},
	componentDidUpdate: function componentDidUpdate() {
		if (this.props.step == 'fade1') {
			this.timeoutID = window.setTimeout((function () {
				dispatcher.dispatch({ type: 'goto', step: 'instruction' });
			}).bind(this), 1500);
		} else {
			window.clearTimeout(this.timeoutID);
		}
	}
});

App.Content.Instruction = React.createClass({
	displayName: 'Instruction',

	render: function render() {
		return React.createElement(
			'div',
			{ style: m(this.styles.container, this.props.step == 'instruction' && this.styles.show) },
			React.createElement(
				'div',
				{ className: 'valign-container', style: this.styles.inner },
				React.createElement(
					'div',
					{ className: 'valign text-center' },
					React.createElement(
						'h2',
						{ style: this.styles.text },
						'COPYTBC. She\'s so damn pretty. But soon, she will be pretty damn dead. Unless you can ',
						React.createElement(
							'p',
							{ style: this.styles.bold },
							'turn on your microphone'
						),
						', scream your lungs out and save her from the werewolf. Whether it\'s a horror lynchfest or a casual popcorn friday night movie, the end is in your hands.'
					)
				)
			)
		);
	},
	styles: {
		container: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			opacity: 0,
			transition: 'opacity .2s ease-in, opacity 1s ease-out',
			WebkitTransition: 'opacity .2s ease-in, opacity 1s ease-out',
			MozTransition: 'opacity .2s ease-in, opacity 1s ease-out',
			OTransition: 'opacity .2s ease-in, opacity 1s ease-out',
			pointerEvents: 'none'
		},
		text: {
			fontFamily: 'Avenir UltraLight',
			fontSize: '24pt',
			fontSize: '2rem',
			fontWeight: 300,
			width: '65%',
			margin: '0 auto'
		},
		inner: {
			position: 'absolute',
			width: '100%',
			height: '100%'
		},
		show: {
			opacity: 1,
			pointerEvents: 'auto'
		},
		bold: {
			display: 'inline',
			fontFamily: 'Avenir',
			fontWeight: 'bold'
		}
	}
});

App.Content.Fade2 = React.createClass({
	displayName: 'Fade2',

	render: function render() {
		return React.createElement('div', { style: m(this.styles.container, this.props.step == 'fade2' && this.styles.show) });
	},
	styles: {
		container: {
			background: 'black',
			opacity: 0,
			transition: 'opacity 1s',
			WebkitTransition: 'opacity 1s',
			MozTransition: 'opacity 1s',
			OTransition: 'opacity 1s'
		},
		show: {
			opacity: 1
		}
	},
	componentDidUpdate: function componentDidUpdate() {
		if (this.props.step == 'fade2') {
			this.timeoutID = window.setTimeout((function () {
				dispatcher.dispatch({ type: 'goto', step: 'game' });
			}).bind(this), 1000);
		} else {
			window.clearTimeout(this.timeoutID);
		}
	}
});

App.Content.Game = React.createClass({
	displayName: 'Game',

	render: function render() {
		var showScreamNow = this.props.showScreamNow;
		return React.createElement(
			'div',
			{ style: m(this.styles.container, this.props.step == 'game' && this.styles.show) },
			React.createElement(
				'video',
				{ id: 'video', style: this.styles.video, width: '640', height: '480', preload: true },
				React.createElement('source', { src: 'video.mp4', type: 'video/mp4' }),
				React.createElement('source', { src: 'video.webm', type: 'video/webm' })
			),
			React.createElement(
				'div',
				{ className: 'valign-container', style: m(this.styles.screamNow, showScreamNow && this.styles.showScreamNow) },
				React.createElement(
					'div',
					{ className: 'valign-top' },
					React.createElement('img', { src: 'images/scream_now.gif', width: '100px', style: this.styles.image })
				)
			)
		);
	},
	styles: {
		container: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			opacity: 0,
			transition: 'opacity 1s',
			WebkitTransition: 'opacity 1s',
			MozTransition: 'opacity 1s',
			OTransition: 'opacity 1s',
			pointerEvents: 'none'
		},
		video: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			objectFit: 'cover'
		},
		screamNow: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			opacity: 0,
			transition: 'opacity .4s',
			WebkitTransition: 'opacity .4s',
			MozTransition: 'opacity .4s',
			OTransition: 'opacity .4s'
		},
		image: {
			marginTop: '16px',
			marginLeft: '16px'
		},
		show: {
			opacity: 1
		},
		showScreamNow: {
			opacity: 1
		}
	},
	getInitialState: function getInitialState() {
		return { game: STATE_IDLE };
	},
	componentDidMount: function componentDidMount() {
		this.video = new MediaElement('video');
		this.video.addEventListener('loadeddata', (function (e) {
			dispatcher.dispatch({ type: 'videoLoaded' });
		}).bind(this));
		this.video.load();
	},
	componentDidUpdate: function componentDidUpdate() {
		if (this.props.step == 'instruction') {
			// Check getUserMedia
			if (!hasGetUserMedia()) {
				alert('getUserMedia() is not supported in your browser');
				return;
			}

			// initialize microphone
			navigator.getUserMedia({
				'audio': {
					'mandatory': {
						'googEchoCancellation': 'false',
						'googAutoGainControl': 'false',
						'googNoiseSuppression': 'false',
						'googHighpassFilter': 'false'
					},
					'optional': []
				}
			}, (function (stream) {
				// Initialize Web Audio
				try {
					window.AudioContext = window.AudioContext || window.webkitAudioContext;
					this.audioContext = new AudioContext();
				} catch (e) {
					alert('Web Audio API is not supported in this browser');
					return;
				}

				// retrieve the current sample rate to be used for WAV packaging
				this.sampleRate = this.audioContext.sampleRate;

				// creates a gain node
				this.volume = this.audioContext.createGain();

				// creates an audio node from the microphone incoming stream
				this.audioInput = this.audioContext.createMediaStreamSource(stream);

				// connect the stream to the gain node
				this.audioInput.connect(this.volume);

				// creates analyzer
				this.analyser = this.audioContext.createAnalyser();
				this.analyser.fftSize = 2048;
				this.bufferLength = this.analyser.frequencyBinCount;
				this.dataArray = new Uint8Array(this.bufferLength);
				this.analyser.getByteFrequencyData(this.dataArray);

				// connect gain to analyzer node
				this.volume.connect(this.analyser);

				dispatcher.dispatch({ type: 'goto', step: 'fade2' });
			}).bind(this), function (err) {
				alert('You either don\'t have microphone or blocked access to it :(');
				dispatcher.dispatch({ type: 'goto', step: 'mainpage' });
				return;
			});
		}

		if (this.state.game == STATE_IDLE && this.props.step == 'game') {
			this.start();
			this.setState({ game: STATE_BEGINNING });
		}
	},
	componentWillUnmount: function componentWillUnmount() {
		this.video = null;
	},
	draw: function draw() {
		requestAnimationFrame(this.draw);

		// Calc elapsed time since last loop
		var now = Date.now();
		this.elapsed = now - this.then;

		if (this.elapsed > this.fpsInterval) {
			this.then = now - this.elapsed % this.fpsInterval;

			switch (this.state.game) {
				case STATE_IDLE:
					break;
				case STATE_BEGINNING:
					var nextTime = this.video.currentTime + this.fpsIntervalSec;
					this.video.setCurrentTime(nextTime);
					if (this.video.currentTime > 5) {
						this.setState({ game: STATE_PLAYING });
						dispatcher.dispatch({ type: 'showScreamNow' });
					}
					break;
				case STATE_PLAYING:
					var avg = 0;
					this.analyser.getByteFrequencyData(this.dataArray);
					for (var i = 0; i < this.bufferLength; i++) {
						var v = this.dataArray[i] / 128.0;
						avg += v;
					}
					avg /= this.bufferLength;

					var currentTime = this.video.currentTime;
					if (currentTime > 5) {
						dispatcher.dispatch({ type: 'showScreamNow' });
					} else {
						dispatcher.dispatch({ type: 'hideScreamNow' });
					}

					if (avg > 0.15) {
						this.video.setCurrentTime(currentTime - this.fpsIntervalSec);
					} else {
						this.video.setCurrentTime(currentTime + this.fpsIntervalSec);
					}

					if (currentTime < 3.5) {
						this.video.setCurrentTime(13.98);
						this.setState({ game: STATE_WIN });
						dispatcher.dispatch({ type: 'hideScreamNow' });
					} else if (currentTime >= 13.8) {
						this.video.setCurrentTime(17.133);
						this.setState({ game: STATE_LOSE });
						dispatcher.dispatch({ type: 'hideScreamNow' });
					}
					break;
				case STATE_WIN:
					this.video.setCurrentTime(this.video.currentTime + this.fpsIntervalSec);
					if (this.video.currentTime >= 17) {
						window.setTimeout((function () {
							this.video.setCurrentTime(0);
						}).bind(this), 1000);
						dispatcher.dispatch({ type: 'goto', step: 'fade3', endstate: 'win' });
						this.setState({ game: STATE_IDLE });
					}
					break;
				case STATE_LOSE:
					this.video.setCurrentTime(this.video.currentTime + this.fpsIntervalSec);
					if (this.video.currentTime >= this.video.duration) {
						window.setTimeout((function () {
							this.video.setCurrentTime(0);
						}).bind(this), 1000);
						dispatcher.dispatch({ type: 'goto', step: 'fade3', endstate: 'lose' });
						this.setState({ game: STATE_IDLE });
					}
					break;
			}
		}
	},
	start: function start() {
		this.fps = 25;
		this.fpsInterval = 1000 / this.fps;
		this.fpsIntervalSec = 1 / this.fps;
		this.then = Date.now();
		this.startTime = this.then;
		this.draw();
	},
	restart: function restart() {
		this.video.setCurrentTime(0);
		this.start();
	}
});

App.Content.Fade3 = React.createClass({
	displayName: 'Fade3',

	render: function render() {
		return React.createElement('div', { style: m(this.styles.container, this.props.step == 'fade3' && this.styles.show) });
	},
	styles: {
		container: {
			background: 'black',
			opacity: 0,
			transition: 'opacity 1s',
			WebkitTransition: 'opacity 1s',
			MozTransition: 'opacity 1s',
			OTransition: 'opacity 1s'
		},
		show: {
			opacity: 1
		}
	},
	componentDidUpdate: function componentDidUpdate() {
		if (this.props.step == 'fade3') {
			this.timeoutID = window.setTimeout((function () {
				dispatcher.dispatch({ type: 'goto', step: this.props.endstate });
			}).bind(this), 1500);
		} else {
			window.clearTimeout(this.timeoutID);
		}
	}
});

App.Content.End = React.createClass({
	displayName: 'End',

	render: function render() {
		var step = this.props.step;
		var bShouldShow = step === 'win' || step === 'lose';
		var iconStyle = m(this.styles.image, bShouldShow && { pointerEvent: 'auto', cursor: 'pointer' });
		return React.createElement(
			'div',
			{ style: m(this.styles.container, bShouldShow && this.styles.show) },
			React.createElement(
				'div',
				{ className: 'valign-container', style: this.styles.inner },
				React.createElement(
					'div',
					{ className: 'valign text-center' },
					React.createElement(
						'h1',
						{ style: this.styles.text },
						step == 'win' ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec orci lacus, ultricies et dui at, hendrerit egestas odio. Sed lacinia, metus sed efficitur efficitu' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec orci lacus, ultricies et dui at, hendrerit egestas odio. Sed lacinia, metus sed efficitur efficitu'
					),
					React.createElement('button', { className: 'btn-restart-large', style: iconStyle, onClick: this.handleRestart }),
					React.createElement('button', { className: 'btn-facebook-large', style: iconStyle, onClick: this.handleFacebook }),
					React.createElement(
						'a',
						{ href: 'http://twitter.com/share?text=Screamsaver', target: 'popup' },
						React.createElement('button', { className: 'btn-twitter-large', style: iconStyle })
					)
				)
			)
		);
	},
	styles: {
		container: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			opacity: 0,
			transition: 'opacity 1s',
			WebkitTransition: 'opacity 1s',
			MozTransition: 'opacity 1s',
			OTransition: 'opacity 1s',
			pointerEvents: 'none'
		},
		inner: {
			position: 'absolute',
			width: '100%',
			height: '100%'
		},
		show: {
			opacity: 1,
			pointerEvents: 'auto'
		},
		text: {
			fontFamily: 'Avenir UltraLight',
			maxWidth: '80%',
			margin: '16px auto'
		},
		image: {
			maxWidth: '64px',
			maxWidth: '4rem',
			margin: '0 16px'
		}
	},
	handleFacebook: function handleFacebook() {
		FB.ui({
			method: 'share',
			href: 'http://screamsaver.bbhmakerlab.io'
		});
	},
	handleRestart: function handleRestart() {
		dispatcher.dispatch({ type: 'goto', step: 'mainpage' });
	}
});

App.Overlay = React.createClass({
	displayName: 'Overlay',

	render: function render() {
		var showCredits = this.props.showCredits;
		var hideStyle = showCredits && this.styles.hide;
		return React.createElement(
			'div',
			{ className: 'no-pointer-events', style: m(this.styles.container, this.props.showInner && this.styles.show) },
			React.createElement(
				'div',
				{ className: 'valign-container', style: m(this.styles.inner, this.styles.creditsContainer, showCredits && this.styles.showCredits) },
				React.createElement(
					'div',
					{ className: 'valign text-center', style: this.styles.creditsInner },
					React.createElement(
						'h1',
						null,
						'Credits'
					),
					React.createElement('br', null),
					React.createElement(
						'h2',
						null,
						'Black Sheep Live'
					),
					React.createElement(
						'h3',
						null,
						'Live & Interaction Direction - The Kissinger Twins'
					),
					React.createElement(
						'h3',
						null,
						'Executive Producer - Vanessa Hurst'
					),
					React.createElement(
						'h3',
						null,
						'DOP - Zoltán Halmágyi'
					),
					React.createElement(
						'h3',
						null,
						'Producer - Ray Chia'
					),
					React.createElement(
						'h3',
						null,
						'Developer - Jacky Boen'
					),
					React.createElement(
						'h3',
						null,
						'Designer - Zac Ong'
					),
					React.createElement(
						'h3',
						null,
						'PA - Nicole Quek'
					),
					React.createElement('br', null),
					React.createElement(
						'h2',
						null,
						'Harper\'s Bazaar'
					),
					React.createElement(
						'h3',
						null,
						'Stylist: Windy Aulia'
					),
					React.createElement(
						'h3',
						null,
						'Models: Darina/Mannequin, Mario/Mannequin'
					),
					React.createElement(
						'h3',
						null,
						'Hair: John Lee / FAC3INC'
					),
					React.createElement(
						'h3',
						null,
						'Makeup: Cheryl Ow'
					),
					React.createElement(
						'h3',
						null,
						'Assistant Stylists:  Debby Kwong, Pakkee Tan'
					)
				)
			),
			React.createElement(
				'div',
				{ style: m(this.styles.inner, this.styles.closeCreditsContainer, showCredits && this.styles.showCredits) },
				React.createElement('div', { className: 'btn-close pointer-events', style: this.styles.closeCredits, onClick: this.handleCloseCredits })
			),
			React.createElement(
				'div',
				{ style: m(this.styles.inner, hideStyle), className: 'valign-container' },
				React.createElement(
					'div',
					{ className: 'valign-bottom text-right' },
					React.createElement(
						'button',
						{ className: 'pointer-events', style: m(this.styles.creditsButton, (this.props.step == 'win' || this.props.step == 'lose') && this.styles.showCreditsButton), onClick: this.handleCredits },
						'Credits'
					)
				)
			),
			React.createElement(
				'div',
				{ style: m(this.styles.inner, hideStyle), className: 'valign-container' },
				React.createElement(
					'div',
					{ className: 'valign-bottom text-left' },
					React.createElement('button', { className: 'btn-facebook pointer-events', style: this.styles.facebook, onClick: this.handleFacebook }),
					React.createElement('a', { className: 'btn-twitter pointer-events', href: 'http://twitter.com/share?text=Screamsaver', target: 'popup', style: this.styles.twitter })
				)
			),
			React.createElement(
				'div',
				{ style: m(this.styles.inner, hideStyle), className: 'text-right' },
				React.createElement('button', { className: cx(this.state.audio ? 'btn-audio-on' : 'btn-audio-off', 'pointer-events'), style: this.styles.audio, onClick: this.handleAudio }),
				React.createElement('button', { className: 'btn-fullscreen pointer-events', style: this.styles.fullscreen, onClick: this.handleFullscreen })
			)
		);
	},
	styles: {
		container: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			pointerEvents: 'none',
			transition: 'opacity .2s',
			WebkitTransition: 'opacity .2s',
			MozTransition: 'opacity .2s',
			OTransition: 'opacity .2s',
			opacity: 0
		},
		inner: {
			position: 'absolute',
			width: '100%',
			height: '100%'
		},
		show: {
			opacity: 1
		},
		creditsContainer: {
			display: 'none',
			background: 'black',
			transition: 'opacity .3s',
			WebkitTransition: 'opacity .3s',
			MozTransition: 'opacity .3s',
			OTransition: 'opacity .3s',
			opacity: 0
		},
		creditsInner: {
			position: 'relative',
			margin: '0 auto',
			height: '100%',
			padding: '16px'
		},
		creditsButton: {
			opacity: 0,
			pointerEvents: 'none',
			padding: '16px',
			background: 'white',
			color: 'black',
			cursor: 'pointer'
		},
		showCredits: {
			display: 'table',
			opacity: 1
		},
		showCreditsButton: {
			opacity: 1,
			pointerEvents: 'auto'
		},
		closeCreditsContainer: {
			display: 'none',
			transition: 'opacity .3s',
			WebkitTransition: 'opacity .3s',
			MozTransition: 'opacity .3s',
			OTransition: 'opacity .3s',
			opacity: 0
		},
		closeCredits: {
			position: 'absolute',
			display: 'inline-block',
			maxWidth: '4rem',
			maxWidth: '64px',
			cursor: 'pointer',
			pointerEvents: 'none'
		},
		hide: {
			display: 'none',
			pointerEvents: 'none'
		}
	},
	getInitialState: function getInitialState() {
		return { fullscreen: false, audio: true };
	},
	componentDidMount: function componentDidMount() {
		this.listenerID = dispatcher.register((function (payload) {
			switch (payload.type) {
				case 'showShare':
					this.setState({ showShare: true });
					break;
			}
		}).bind(this));
	},
	componentWillUnmount: function componentWillUnmount() {
		dispatcher.unregister(this.listenerID);
	},
	handleCredits: function handleCredits(evt) {
		dispatcher.dispatch({ type: 'showCredits' });
	},
	handleFullscreen: function handleFullscreen(evt) {
		var fullscreen = this.state.fullscreen;
		if (screenfull.enabled) {
			screenfull.toggle();
			this.setState({ fullscreen: !fullscreen });
		}
	},
	handleCloseCredits: function handleCloseCredits(evt) {
		dispatcher.dispatch({ type: 'hideCredits' });
	},
	handleCloseShare: function handleCloseShare(evt) {
		this.setState({ showShare: false });
	},
	handleAudio: function handleAudio(evt) {
		var audio = this.state.audio;
		this.setState({ audio: !audio });
	},
	handleFacebook: function handleFacebook(evt) {
		FB.ui({
			method: 'share',
			href: 'http://screamsaver.bbhmakerlab.io'
		});
	}
});

App.LoadingScreen = React.createClass({
	displayName: 'LoadingScreen',

	render: function render() {
		return React.createElement(
			'div',
			{ id: 'loading-screen', className: 'valign-wrapper', style: m(this.styles.container, this.props.loaded && this.styles.hide) },
			React.createElement(
				'div',
				{ className: 'valign sk-circle', style: this.styles.spinner },
				React.createElement('div', { className: 'sk-circle1 sk-child' }),
				React.createElement('div', { className: 'sk-circle2 sk-child' }),
				React.createElement('div', { className: 'sk-circle3 sk-child' }),
				React.createElement('div', { className: 'sk-circle4 sk-child' }),
				React.createElement('div', { className: 'sk-circle5 sk-child' }),
				React.createElement('div', { className: 'sk-circle6 sk-child' }),
				React.createElement('div', { className: 'sk-circle7 sk-child' }),
				React.createElement('div', { className: 'sk-circle8 sk-child' }),
				React.createElement('div', { className: 'sk-circle9 sk-child' }),
				React.createElement('div', { className: 'sk-circle10 sk-child' }),
				React.createElement('div', { className: 'sk-circle11 sk-child' }),
				React.createElement('div', { className: 'sk-circle12 sk-child' })
			)
		);
	},
	styles: {
		container: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			background: 'black',
			pointerEvents: 'none',
			transition: 'opacity 1s',
			WebkitTransition: 'opacity 1s',
			MozTransition: 'opacity 1s',
			OTransition: 'opacity 1s',
			opacity: 1
		},
		spinner: {
			position: 'absolute',
			top: '50%',
			left: '50%',
			margin: '0 auto'
		},
		hide: {
			opacity: 0
		}
	}
});

function m(a, b, c) {
	a = a ? a : {};
	b = b ? b : {};
	c = c ? c : {};
	var ab = update(a, { $merge: b });
	return update(ab, { $merge: c });
}

function hasGetUserMedia() {
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
	return !!navigator.getUserMedia;
}

ReactDOM.render(React.createElement(App, null), document.getElementById('root'));
/*<h1 style={this.styles.title}>The Scream Saver</h1>*/