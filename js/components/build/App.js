'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');
var ReactDOM = require('react-dom');
var Flux = require('flux');
var screenfull = require('screenfull');
var update = require('react-addons-update');
var cx = require('classnames');
var dispatcher = new Flux.Dispatcher();

var video = undefined;
var gameAudio = undefined;
var sensitivity = 0;

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
			React.createElement(App.Audio, _extends({ ref: 'audio' }, this.state)),
			React.createElement(App.Content, _extends({ ref: 'content' }, this.state, { fadeAudio: this.fadeAudio })),
			React.createElement(App.Overlay, _extends({ ref: 'overlay' }, this.state)),
			React.createElement(App.LoadingScreen, { loaded: loaded })
		);
	},
	getInitialState: function getInitialState() {
		return {
			loaded: false,
			step: '',
			endingText: '',
			showInner: false,
			showScreamNow: false,
			showCredit: false,
			audio: true,
			volume: 1
		};
	},
	componentDidMount: function componentDidMount() {
		this.listenerID = dispatcher.register((function (payload) {
			switch (payload.type) {
				case 'goto':
					if (payload.step == 'win') {
						this.setState({ step: 'win', endingText: 'images/happy_ending.png' });
					} else if (payload.step == 'lose') {
						this.setState({ step: 'lose', endingText: 'images/unhappy_ending.png' });
					} else {
						this.setState({ step: payload.step });
					}
					break;
				case 'restart':
					this.restart();
					break;
				case 'imageLoaded':
				case 'videoLoaded':
				case 'copyLoaded':
					var loaded = this.state.loaded + 1;
					this.setState({ loaded: loaded });
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
				case 'toggleAudio':
					this.setState({ audio: !this.state.audio });
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
	},
	fadeAudio: function fadeAudio(dir) {
		window.clearTimeout(this.fadeAudioID);
		this.fadeAudioID = window.setTimeout((function () {
			var volume = this.state.volume;
			if (dir > 0) {
				volume = Math.min(volume + 0.033 * dir, 1);
			} else {
				volume = Math.max(volume + 0.033 * dir, 0);
			}
			this.setState({ volume: volume });
			if (volume > 0 || volume < 1) {
				this.fadeAudio(dir);
			}
		}).bind(this), 33);
	}
});

App.Audio = React.createClass({
	displayName: 'Audio',

	render: function render() {
		return React.createElement(
			'audio',
			{ ref: 'game', loop: true, muted: !this.props.audio },
			React.createElement('source', { src: 'sounds/game.mp3', type: 'audio/mpeg' })
		);
	},
	componentDidMount: function componentDidMount() {
		gameAudio = this.refs.game;
		setTimeout((function () {
			gameAudio.play();
		}).bind(this), 1000);
	},
	componentDidUpdate: function componentDidUpdate() {
		gameAudio.volume = this.props.volume;
	}
});

App.Content = React.createClass({
	displayName: 'Content',

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'container' },
			React.createElement(App.Content.Background, this.props),
			React.createElement(App.Content.MainPage, this.props),
			React.createElement(App.Content.Fade1, this.props),
			React.createElement(App.Content.Instruction, this.props),
			React.createElement(App.Content.Fade2, this.props),
			React.createElement(App.Content.Game, this.props),
			React.createElement(App.Content.End, this.props)
		);
	}
});

App.Content.Background = React.createClass({
	displayName: 'Background',

	render: function render() {
		return React.createElement(
			'div',
			{ className: cx('background container', this.props.step == 'mainpage' && 'background--active') },
			React.createElement('img', { className: 'background-image', src: 'images/home.jpg', onLoad: this.imageLoaded })
		);
	},
	imageLoaded: function imageLoaded(event) {
		dispatcher.dispatch({ type: 'imageLoaded' });
	}
});

App.Content.MainPage = React.createClass({
	displayName: 'MainPage',

	render: function render() {
		var show = this.props.step == 'mainpage';
		var showInner = this.props.showInner;
		var clickableClass = show ? 'pointer-events' : '';
		return React.createElement(
			'div',
			{ className: cx('mainpage container', show && 'mainpage--active') },
			React.createElement(
				'div',
				{ className: cx('mainpage-inner mainpage-inner-top flex column one justify-start align-center', showInner && 'mainpage-inner--active') },
				React.createElement('div', { className: 'harpersbazaar' }),
				React.createElement('div', { className: 'presents' })
			),
			React.createElement(
				'div',
				{ className: cx('mainpage-inner mainpage-inner-mid flex column justify-center align-center', showInner && 'mainpage-inner--active') },
				React.createElement('img', { className: 'mainpage-title', src: 'images/main_title.png' }),
				React.createElement(
					'h2',
					{ className: 'mainpage-subtitle' },
					'A Halloween Interactive Film by The Kissinger Twins'
				),
				React.createElement('button', { className: 'mainpage-start', onClick: this.handleStart })
			),
			React.createElement(
				'div',
				{ className: cx('mainpage-inner mainpage-inner-bottom flex justify-center align-end', showInner && 'mainpage-inner--active') },
				React.createElement('a', { href: 'http://blacksheeplive.com', className: cx('blacksheeplive', clickableClass), target: '_blank' })
			)
		);
	},
	getInitialState: function getInitialState() {
		return { hoverStart: false };
	},
	handleStart: function handleStart(event) {
		event.preventDefault();
		video.playbackRate = 0;
		video.play();
		dispatcher.dispatch({ type: 'goto', step: 'fade1' });
	}
});

App.Content.Fade1 = React.createClass({
	displayName: 'Fade1',

	render: function render() {
		return React.createElement('div', { className: cx('fade1', this.props.step == 'fade1' && 'fade1--active') });
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
			{ className: cx('instruction flex container', this.props.step == 'instruction' && 'instruction--active') },
			React.createElement(
				'div',
				{ className: 'flex one container justify-center align-center' },
				React.createElement('img', { className: 'instruction-text', src: 'images/instruction.png' })
			),
			React.createElement(
				'div',
				{ className: 'flex one container justify-center align-end' },
				React.createElement('img', { className: 'instruction-text-below', src: 'images/instruction_belowtext.png' })
			)
		);
	}
});

App.Content.Fade2 = React.createClass({
	displayName: 'Fade2',

	render: function render() {
		return React.createElement('div', { className: cx('fade2', this.props.step == 'fade2' && 'fade2--active') });
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
			{ className: cx('game container', this.props.step == 'game' && 'game--active') },
			React.createElement(
				'video',
				{ ref: 'video', className: 'container game-video', preload: '', muted: !this.props.audio, volume: 0.1 },
				React.createElement('source', { src: 'videos/video.mp4', type: 'video/mp4' })
			),
			React.createElement(
				'div',
				{ className: cx('game-scream-now flex one container align-start', showScreamNow && 'game-scream-now--active') },
				React.createElement('img', { className: 'game-scream-now-image', src: 'images/scream_now.gif', width: '100px' })
			)
		);
	},
	percent: 0,
	getInitialState: function getInitialState() {
		return {
			game: STATE_IDLE,
			shouldAddSources: false,
			screams: 0
		};
	},
	componentDidMount: function componentDidMount() {
		video = this.refs.video;

		video.addEventListener('loadeddata', (function (e) {
			dispatcher.dispatch({ type: 'videoLoaded' });
		}).bind(this));

		video.addEventListener('ended', (function (e) {
			video.pause();
			window.setTimeout((function () {
				video.currentTime = 0;
			}).bind(this), 1000);
			dispatcher.dispatch({ type: 'goto', step: 'win' });
			this.setState({ game: STATE_IDLE });
		}).bind(this));

		video.load();
	},
	componentDidUpdate: function componentDidUpdate() {
		if (this.props.step == 'instruction') {
			// Check getUserMedia
			if (!hasGetUserMedia()) {
				alert('Microphone is not supported by this browser :(');
				return;
			}

			// Initialize microphone
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

				// Retrieve the current sample rate to be used for WAV packaging
				this.sampleRate = this.audioContext.sampleRate;

				// Creates a gain node
				this.volume = this.audioContext.createGain();

				// Creates an audio node from the microphone incoming stream
				this.audioInput = this.audioContext.createMediaStreamSource(stream);

				// Connect the stream to the gain node
				this.audioInput.connect(this.volume);

				// Creates analyzer
				this.analyser = this.audioContext.createAnalyser();
				this.analyser.fftSize = 2048;
				this.bufferLength = this.analyser.frequencyBinCount;
				this.dataArray = new Uint8Array(this.bufferLength);
				this.analyser.getByteFrequencyData(this.dataArray);

				// Connect gain to analyzer node
				this.volume.connect(this.analyser);

				dispatcher.dispatch({ type: 'goto', step: 'fade2' });
			}).bind(this), function (err) {
				alert('You either don\'t have microphone or blocked access to it :(');
				dispatcher.dispatch({ type: 'goto', step: 'mainpage' });
				return;
			});
		}

		if (this.state.game == STATE_IDLE && this.props.step == 'game') {
			this.props.fadeAudio(0.5);
			video.pause();
			video.currentTime = 0;
			this.start();
			video.playbackRate = 1;
			video.play();
			this.setState({ game: STATE_BEGINNING });
		}
	},
	draw: function draw() {
		requestAnimationFrame(this.draw);

		// Calc elapsed time since last loop
		var now = Date.now();
		this.elapsed = now - this.then;

		var avg = 0;
		this.analyser.getByteFrequencyData(this.dataArray);
		for (var i = 0; i < this.bufferLength; i++) {
			var v = this.dataArray[i] / 128.0;
			avg += v;
		}
		avg /= this.bufferLength;

		if (this.elapsed >= this.fpsInterval) {
			this.then = now - this.elapsed % this.fpsInterval;

			switch (this.state.game) {
				case STATE_IDLE:
					break;
				case STATE_BEGINNING:
					if (sensitivity == 0) {
						sensitivity = avg;
					} else {
						sensitivity = Math.max(sensitivity, avg);
					}
					if (video.currentTime > 5) {
						this.setState({ game: STATE_PLAYING });
						dispatcher.dispatch({ type: 'showScreamNow' });
					}
					break;
				case STATE_PLAYING:
					if (video.currentTime > 5) {
						dispatcher.dispatch({ type: 'showScreamNow' });
					} else {
						dispatcher.dispatch({ type: 'hideScreamNow' });
					}

					var screams = this.state.screams;
					if (avg > sensitivity + 0.0365) {
						if (avg != this.prevAvg) {
							video.pause();
							video.playbackRate = 0;
						}
						if (video.currentTime > 6) {
							//screams = 1;
							screams = 2;
							this.setState({ screams: screams });
						} else {
							screams = 2;
							this.setState({ screams: screams });
						}
					} else {
						if (avg != this.prevAvg) {
							video.playbackRate = 1;
							video.play();
						}
					}
					this.prevAvg = avg;

					switch (this.state.screams) {
						case 1:
							if (video.currentTime > 6) {
								video.currentTime = video.currentTime - this.fpsIntervalSec * 2;
							} else {
								video.playbackRate = 0;
							}
							break;
						case 2:
							video.currentTime = video.currentTime - this.fpsIntervalSec * 2;
							break;
					}

					if (video.currentTime < 1.5) {
						video.currentTime = 33.3;
						this.props.fadeAudio(-2);
						this.setState({ game: STATE_WIN });
						dispatcher.dispatch({ type: 'hideScreamNow' });
					} else if (video.currentTime > 12.5) {
						this.props.fadeAudio(-2);
						this.setState({ game: STATE_LOSE });
						dispatcher.dispatch({ type: 'hideScreamNow' });
					}
					break;
				case STATE_WIN:
					video.playbackRate = 1;
					video.play();
					break;
				case STATE_LOSE:
					if (video.currentTime >= 32.3) {
						video.pause();
						window.setTimeout((function () {
							video.currentTime = 0;
						}).bind(this), 1000);
						dispatcher.dispatch({ type: 'goto', step: 'lose' });
						this.setState({ game: STATE_IDLE });
					}
					break;
			}
		}
	},
	start: function start() {
		this.setState({ screams: 0 });
		video.currentTime = 0;
		sensitivity = 0;
		this.prevAvg = 0;
		this.fps = 25;
		this.fpsInterval = 1000 / this.fps;
		this.fpsIntervalSec = 1 / this.fps;
		this.then = Date.now();
		this.startTime = this.then;
		this.draw();
	},
	restart: function restart() {
		this.start();
	}
});

App.Content.End = React.createClass({
	displayName: 'End',

	render: function render() {
		var step = this.props.step;
		var shouldShow = step === 'win' || step === 'lose';
		var imgSrc = step == 'win' ? 'images/happy_ending.png' : step == 'lose' ? 'images/unhappy_ending.png' : this.props.endingText;
		return React.createElement(
			'div',
			{ className: cx('end flex one column container justify-center align-center', shouldShow && 'end--active', this.props.showCredits && 'end--show-credits') },
			React.createElement('img', { className: 'end-text', src: imgSrc }),
			React.createElement(
				'div',
				null,
				React.createElement('button', { className: 'large-restart-button end-icon', onClick: this.handleRestart }),
				React.createElement('button', { className: 'large-facebook-button end-icon', onClick: this.handleFacebook }),
				React.createElement(
					'a',
					{ href: 'http://twitter.com/share?text=Harper%27s%20BAZAAR%20SG%20%26%20BSL%20present%3A%20Scream%20Saver%2C%20an%20interactive%20Halloween%20film%20by%20The%20Kissinger%20Twins', target: 'popup' },
					React.createElement('button', { className: 'large-twitter-button end-icon' })
				)
			)
		);
	},
	handleFacebook: function handleFacebook(evt) {
		FB.ui({
			method: 'feed',
			link: 'http://www.harpersbazaar.com.sg/screamsaver',
			description: 'Harper\'s BAZAAR SG & BSL present: Scream Saver, an interactive Halloween film by The Kissinger Twins'
		});
	},
	handleRestart: function handleRestart() {
		dispatcher.dispatch({ type: 'goto', step: 'fade2' });
	}
});

App.Overlay = React.createClass({
	displayName: 'Overlay',

	render: function render() {
		var showCredits = this.props.showCredits;
		var showCreditsButton = this.props.step == 'win' || this.props.step == 'lose';
		return React.createElement(
			'div',
			{ className: cx('overlay flex one container', this.props.showInner && 'overlay--active') },
			React.createElement(
				'div',
				{ className: cx('overlay-credits-container flex one container justify-center align-center', showCredits && 'show-credits') },
				React.createElement(
					'div',
					{ className: 'overlay-credits-inner' },
					React.createElement('img', { className: 'overlay-credits-title', src: 'images/credits.png' }),
					React.createElement('br', null),
					React.createElement('br', null),
					React.createElement(
						'h2',
						{ className: 'credits-subtitle text-center' },
						'Cast'
					),
					React.createElement('br', null),
					React.createElement(
						'table',
						{ className: 'credits-table' },
						React.createElement(
							'tbody',
							null,
							React.createElement(
								'tr',
								null,
								React.createElement(
									'td',
									{ className: 'credits-role' },
									'GIRL'
								),
								React.createElement(
									'td',
									{ className: 'credits-name' },
									'Darina Kravchenko / Mannequin'
								)
							),
							React.createElement(
								'tr',
								null,
								React.createElement(
									'td',
									{ className: 'credits-role' },
									'BEAST'
								),
								React.createElement(
									'td',
									{ className: 'credits-name' },
									'Mario Adrion / Mannequin'
								)
							)
						)
					),
					React.createElement('br', null),
					React.createElement(
						'h2',
						{ className: 'credits-subtitle text-center' },
						'Black Sheep Live'
					),
					React.createElement('br', null),
					React.createElement(
						'table',
						{ className: 'credits-table' },
						React.createElement(
							'tbody',
							null,
							React.createElement(
								'tr',
								null,
								React.createElement(
									'td',
									{ className: 'credits-role' },
									'LIVE & INTERACTIVE DIRECTION'
								),
								React.createElement(
									'td',
									{ className: 'credits-name' },
									'The Kissinger Twins'
								)
							),
							React.createElement(
								'tr',
								null,
								React.createElement(
									'td',
									{ className: 'credits-role' },
									'EXECUTIVE PRODUCER'
								),
								React.createElement(
									'td',
									{ className: 'credits-name' },
									'Vanessa Hurst'
								)
							),
							React.createElement(
								'tr',
								null,
								React.createElement(
									'td',
									{ className: 'credits-role' },
									'DOP'
								),
								React.createElement(
									'td',
									{ className: 'credits-name' },
									'Zoltan Halmagyi'
								)
							),
							React.createElement(
								'tr',
								null,
								React.createElement(
									'td',
									{ className: 'credits-role' },
									'PRODUCER'
								),
								React.createElement(
									'td',
									{ className: 'credits-name' },
									'Ray Chia'
								)
							),
							React.createElement(
								'tr',
								null,
								React.createElement(
									'td',
									{ className: 'credits-role' },
									'DEVELOPER'
								),
								React.createElement(
									'td',
									{ className: 'credits-name' },
									'Jacky Boen'
								)
							),
							React.createElement(
								'tr',
								null,
								React.createElement(
									'td',
									{ className: 'credits-role' },
									'DESIGNER'
								),
								React.createElement(
									'td',
									{ className: 'credits-name' },
									'Zac Ong'
								)
							),
							React.createElement(
								'tr',
								null,
								React.createElement(
									'td',
									{ className: 'credits-role' },
									'COPYWRITER'
								),
								React.createElement(
									'td',
									{ className: 'credits-name' },
									'Nikhil Panjwani'
								)
							),
							React.createElement(
								'tr',
								null,
								React.createElement(
									'td',
									{ className: 'credits-role' },
									'PA'
								),
								React.createElement(
									'td',
									{ className: 'credits-name' },
									'Nicole Quek'
								)
							),
							React.createElement(
								'tr',
								null,
								React.createElement(
									'td',
									{ className: 'credits-role' },
									'MUSIC'
								),
								React.createElement(
									'td',
									{ className: 'credits-name' },
									'Filip Marcinkowski'
								)
							)
						)
					),
					React.createElement('br', null),
					React.createElement(
						'h2',
						{ className: 'credits-subtitle text-center' },
						'Harper\'s Bazaar'
					),
					React.createElement('br', null),
					React.createElement(
						'table',
						{ className: 'credits-table' },
						React.createElement(
							'tbody',
							null,
							React.createElement(
								'tr',
								null,
								React.createElement(
									'td',
									{ className: 'credits-role' },
									'STYLIST'
								),
								React.createElement(
									'td',
									{ className: 'credits-name' },
									'Windy Aulia'
								)
							),
							React.createElement(
								'tr',
								null,
								React.createElement(
									'td',
									{ className: 'credits-role' },
									'HAIR'
								),
								React.createElement(
									'td',
									{ className: 'credits-name' },
									'John Lee / FAC4INC'
								)
							),
							React.createElement(
								'tr',
								null,
								React.createElement(
									'td',
									{ className: 'credits-role' },
									'MAKEUP'
								),
								React.createElement(
									'td',
									{ className: 'credits-name' },
									'Cheryl Ow'
								)
							),
							React.createElement(
								'tr',
								null,
								React.createElement(
									'td',
									{ className: 'credits-role' },
									'ASSISTANT STYLISTS'
								),
								React.createElement(
									'td',
									{ className: 'credits-name' },
									'Debby Kwong'
								)
							),
							React.createElement(
								'tr',
								null,
								React.createElement('td', { className: 'credits-role' }),
								React.createElement(
									'td',
									{ className: 'credits-name' },
									'Pakkee Tan'
								)
							)
						)
					)
				)
			),
			React.createElement(
				'div',
				{ className: cx('close-credits-container container', showCredits && 'show-credits') },
				React.createElement('div', { className: 'close-credits-button', onClick: this.handleCloseCredits })
			),
			React.createElement(
				'div',
				{ className: cx('flex one container justify-end align-end', showCredits && 'credits-hide') },
				React.createElement('button', { className: 'credits-button', onClick: this.handleCredits })
			),
			React.createElement(
				'div',
				{ className: cx('flex one container justify-start align-end', showCredits && 'credits-hide') },
				React.createElement('button', { className: 'facebook-button', onClick: this.handleFacebook }),
				React.createElement('a', { className: 'twitter-button', href: 'http://twitter.com/share?text=Harper%27s%20BAZAAR%20SG%20%26%20BSL%20present%3A%20Scream%20Saver%2C%20an%20interactive%20Halloween%20film%20by%20The%20Kissinger%20Twins', target: 'popup' })
			),
			React.createElement(
				'div',
				{ className: cx('flex one container justify-end', showCredits && 'credits-hide') },
				React.createElement('button', { className: cx(this.props.audio ? 'on-audio-button' : 'off-audio-button', 'pointer-events'), onClick: this.handleAudio }),
				React.createElement('button', { className: 'fullscreen-button', onClick: this.handleFullscreen })
			)
		);
	},
	getInitialState: function getInitialState() {
		return { fullscreen: false };
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
		dispatcher.dispatch({ type: 'toggleAudio' });
	},
	handleFacebook: function handleFacebook(evt) {
		FB.ui({
			method: 'feed',
			link: 'http://www.harpersbazaar.com.sg/screamsaver',
			description: 'Harper\'s BAZAAR SG & BSL present: Scream Saver, an interactive Halloween film by The Kissinger Twins'
		});
	}
});

App.LoadingScreen = React.createClass({
	displayName: 'LoadingScreen',

	render: function render() {
		var elem = undefined;

		switch (this.state.state) {
			case 0:
				elem = React.createElement('img', { key: 'loader', className: 'loading-screen-loader', src: 'images/loader.gif' });
				break;
			case 1:
				elem = React.createElement('img', { key: 'loader', className: 'loading-screen-loader loading-screen-loader--disabled', src: 'images/loader.gif' });
				break;
			case 2:
			case 4:
				elem = React.createElement('img', { key: 'gate', className: 'loading-screen-gate loading-screen-gate--disabled', src: 'images/TheScreamSaver_Gate.jpg' });
				break;
			case 3:
				elem = React.createElement('img', { key: 'gate', className: 'loading-screen-gate', src: 'images/TheScreamSaver_Gate.jpg' });
				break;
		}

		return React.createElement(
			'div',
			{ className: cx('loading-screen flex one container', this.props.loaded >= 3 && 'loading-screen--disabled') },
			React.createElement(
				'div',
				{ className: 'container flex one justify-center align-center' },
				elem
			),
			React.createElement(
				'div',
				{ className: 'flex one container justify-center align-end' },
				React.createElement('img', { className: cx('loading-screen-preload-text', this.state.state > 0 && 'loading-screen-preload-text--disabled'), src: 'images/preload_text.png' })
			)
		);
	},
	getInitialState: function getInitialState() {
		return {
			state: 0,
			progress: 0
		};
	},
	componentDidMount: function componentDidMount() {
		this.listenerID = dispatcher.register((function (payload) {
			switch (payload.type) {
				case 'videoLoadProgress':
					this.setState({ progress: payload.progress });
					break;
			}
		}).bind(this));
	},
	componentDidUpdate: function componentDidUpdate() {
		var state = this.state.state;

		switch (state) {
			case 0:
				if (this.props.loaded >= 2) {
					setTimeout((function () {
						this.setState({ state: 1 });
					}).bind(this), 2000);
				}
				break;
			case 1:
				setTimeout((function () {
					this.setState({ state: 2 });
				}).bind(this), 1000);
				break;
			case 2:
				setTimeout((function () {
					this.setState({ state: 3 });
				}).bind(this), 1000);
				break;
			case 3:
				setTimeout((function () {
					this.setState({ state: 4 });
				}).bind(this), 3000);
				break;
			case 4:
				setTimeout((function () {
					dispatcher.dispatch({ type: 'copyLoaded' });
					this.setState({ state: 5 });
				}).bind(this), 1000);
		}
	},
	componentWillUnmount: function componentWillUnmount() {
		dispatcher.unregister(this.listenerID);
	}
});

var Unsupported = React.createClass({
	displayName: 'Unsupported',

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'unsupported flex one container justify-center align-center' },
			React.createElement(
				'h1',
				{ className: 'unsupported-text' },
				'Sorry.. your browser doesn\'t have the required feature to view this website :('
			)
		);
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

if (hasGetUserMedia()) {
	window.addEventListener('keyup', function (event) {
		event.preventDefault();
		event.stopPropagation();
	});

	ReactDOM.render(React.createElement(App, null), document.getElementById('root'));
} else {
	ReactDOM.render(React.createElement(Unsupported, null), document.getElementById('root'));
}