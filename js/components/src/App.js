'use strict';

let React = require('react');
let ReactDOM = require('react-dom');
let Flux = require('flux');
let screenfull = require('screenfull');
let update = require('react-addons-update');
let cx = require('classnames');
let dispatcher = new Flux.Dispatcher();

let video;
let gameAudio;
let sensitivity = 0;

let STATE_IDLE = 0,
    STATE_BEGINNING = 1,
    STATE_PLAYING   = 2,
    STATE_WIN = 3,
    STATE_LOSE = 4;

let App = React.createClass({
	render: function() {
		let loaded = this.state.loaded;
		return (
			<div>
				<App.Audio ref='audio' {...this.state} />
				<App.Content ref='content' {...this.state} fadeAudio={this.fadeAudio} />
				<App.Overlay ref='overlay' {...this.state} />
				<App.LoadingScreen loaded={loaded} />
			</div>
		)
	},
	getInitialState: function() {
		return {
			loaded: false,
			step: '',
			endingText: '',
			showInner: false,
			showScreamNow: false,
			showCredit: false,
			audio: true,
			volume: 1,
		};
	},
	componentDidMount: function() {
		this.listenerID = dispatcher.register(function(payload) {
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
				let loaded = this.state.loaded + 1;
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
		}.bind(this));

		window.setTimeout(function() {
			this.setState({ step: 'mainpage' });
		}.bind(this), 1000);

		window.setTimeout(function() {
			this.setState({ showInner: true });
		}.bind(this), 2000);
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.listenerID);
	},
	fadeAudio: function(dir) {
		window.clearTimeout(this.fadeAudioID);
		this.fadeAudioID = window.setTimeout(function() {
			let volume = this.state.volume;
			if (dir > 0) {
				volume = Math.min(volume + 0.033 * dir, 1);
			} else {
				volume = Math.max(volume + 0.033 * dir, 0);
			}
			this.setState({ volume: volume });
			if (volume > 0 || volume < 1) {
				this.fadeAudio(dir);
			} 
		}.bind(this), 33);
	},
});

App.Audio = React.createClass({
	render: function() {
		return (
			<audio ref='game' loop muted={!this.props.audio}>
				<source src='sounds/game.mp3' type='audio/mpeg' />
			</audio>
		)
	},
	componentDidMount: function() {
		gameAudio = this.refs.game;
		setTimeout(function() {
			gameAudio.play();
		}.bind(this), 1000);
	},
	componentDidUpdate: function() {
		gameAudio.volume = this.props.volume;
	},
});

App.Content = React.createClass({
	render: function() {
		return (
			<div className='container'>
				<App.Content.Background {...this.props} />
				<App.Content.MainPage { ...this.props } />
				<App.Content.Fade1 { ...this.props } />
				<App.Content.Instruction { ...this.props } />
				<App.Content.Fade2 { ...this.props } />
				<App.Content.Game { ...this.props } />
				<App.Content.End { ...this.props } />
			</div>
		)
	},
});

App.Content.Background = React.createClass({
	render: function() {
		return (
			<div className={cx('background container', this.props.step == 'mainpage' && 'background--active')}>
				<img className='background-image' src='images/home.jpg' onLoad={this.imageLoaded} />
			</div>
		)
	},
	imageLoaded: function(event) {
		dispatcher.dispatch({ type: 'imageLoaded' });
	},
});

App.Content.MainPage = React.createClass({
	render: function() {
		let show = this.props.step == 'mainpage';
		let showInner = this.props.showInner;
		let clickableClass = show ? 'pointer-events' : '';
		return (
			<div className={cx('mainpage container', show && 'mainpage--active')}>
				<div className={cx('mainpage-inner mainpage-inner-top flex column one justify-start align-center', showInner && 'mainpage-inner--active')}>
					<div className='harpersbazaar' />
					<div className='presents' />
				</div>
				<div className={cx('mainpage-inner mainpage-inner-mid flex column justify-center align-center', showInner && 'mainpage-inner--active')}>
					<img className='mainpage-title' src='images/main_title.png' />
					<h2 className='mainpage-subtitle'>A Halloween Interactive Film by The Kissinger Twins</h2>
					<button className='mainpage-start' onClick={this.handleStart}></button>
				</div>
				<div className={cx('mainpage-inner mainpage-inner-bottom flex justify-center align-end', showInner && 'mainpage-inner--active')}>
					<a href='http://blacksheeplive.com' className={cx('blacksheeplive', clickableClass)} target='_blank' />
				</div>
			</div>
		)
	},
	getInitialState: function() {
		return { hoverStart: false };
	},
	handleStart: function(event) {
		event.preventDefault();
		video.playbackRate = 0;
		video.play();
		dispatcher.dispatch({ type: 'goto', step: 'fade1' });
	},
});

App.Content.Fade1 = React.createClass({
	render: function() {
		return (
			<div className={cx('fade1', this.props.step == 'fade1' && 'fade1--active')}></div>
		)
	},
	componentDidUpdate: function() {
		if (this.props.step == 'fade1') {
			this.timeoutID = window.setTimeout(function() {
				dispatcher.dispatch({ type: 'goto', step: 'instruction' });
			}.bind(this), 1500);
		} else {
			window.clearTimeout(this.timeoutID);
		}
	},
});

App.Content.Instruction = React.createClass({
	render: function() {
		return (
			<div className={cx('instruction flex container', this.props.step == 'instruction' && 'instruction--active')}>
				<div className='flex one container justify-center align-center'>
					<img className='instruction-text' src='images/instruction.png' />
				</div>
				<div className='flex one container justify-center align-end'>
					<img className='instruction-text-below' src='images/instruction_belowtext.png' />
				</div>
			</div>
		)
	},
});

App.Content.Fade2 = React.createClass({
	render: function() {
		return <div className={cx('fade2', this.props.step == 'fade2' && 'fade2--active')}></div>
	},
	componentDidUpdate: function() {
		if (this.props.step == 'fade2') {
			this.timeoutID = window.setTimeout(function() {
				dispatcher.dispatch({ type: 'goto', step: 'game' });
			}.bind(this), 1000);
		} else {
			window.clearTimeout(this.timeoutID);
		}
	},
});

App.Content.Game = React.createClass({
	render: function() {
		let showScreamNow = this.props.showScreamNow;
		return (
			<div className={cx('game container', this.props.step == 'game' && 'game--active')}>
				<video ref='video' className='container game-video' preload='' muted={!this.props.audio} volume={0.1}>
					<source src='videos/video.mp4' type='video/mp4' />
				</video>
				<div className={cx('game-scream-now flex one container align-start', showScreamNow && 'game-scream-now--active')}>
					<img className='game-scream-now-image' src='images/scream_now.gif' width='100px' />
				</div>
			</div>
		)
	},
	percent: 0,
	getInitialState: function() {
		return {
			game: STATE_IDLE,
			shouldAddSources: false,
			screams: 0,
		}
	},
	componentDidMount: function() {
		video = this.refs.video;

		video.addEventListener('loadeddata', function(e) {
			dispatcher.dispatch({ type: 'videoLoaded' });
		}.bind(this));

		video.addEventListener('ended', function(e) {
			video.pause();
			window.setTimeout(function() { video.currentTime = 0; }.bind(this), 1000);
			dispatcher.dispatch({ type: 'goto', step: 'win' });
			this.setState({ game: STATE_IDLE });
		}.bind(this));

		video.load();
	},
	componentDidUpdate: function() {
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
					'optional': [],
				},
			}, function(stream) {
				// Initialize Web Audio
				try {
					window.AudioContext = window.AudioContext || window.webkitAudioContext;
					this.audioContext = new AudioContext();
				} catch(e) {
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
			}.bind(this), function(err) {
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
	draw: function() {
		requestAnimationFrame(this.draw);

		// Calc elapsed time since last loop
		let now = Date.now();
		this.elapsed = now - this.then;

		let avg = 0;
		this.analyser.getByteFrequencyData(this.dataArray);
		for (let i = 0; i < this.bufferLength; i++) {
			let v = this.dataArray[i] / 128.0;
			avg += v;
		}
		avg /= this.bufferLength;

		if (this.elapsed >= this.fpsInterval) {
			this.then = now - (this.elapsed % this.fpsInterval);

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

				let screams = this.state.screams;
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
					window.setTimeout(function() { video.currentTime = 0; }.bind(this), 1000);
					dispatcher.dispatch({ type: 'goto', step: 'lose' });
					this.setState({ game: STATE_IDLE });
				}
				break;
			}
		}
	},
	start: function() {
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
	restart: function() {
		this.start();
	},
});

App.Content.End = React.createClass({
	render: function() {
		let step = this.props.step;
		let shouldShow = step === 'win' || step === 'lose';
		let imgSrc = step == 'win'  ? 'images/happy_ending.png' :
					 step == 'lose' ? 'images/unhappy_ending.png' : this.props.endingText;
		return (
			<div className={cx('end flex one column container justify-center align-center', shouldShow && 'end--active', this.props.showCredits && 'end--show-credits')}>
				<img className='end-text' src={imgSrc} />
				<div>
					<button className='large-restart-button end-icon' onClick={this.handleRestart}></button>
					<button className='large-facebook-button end-icon' onClick={this.handleFacebook}></button>
					<a href='http://twitter.com/share?text=Harper%27s%20BAZAAR%20SG%20%26%20BSL%20present%3A%20Scream%20Saver%2C%20an%20interactive%20Halloween%20film%20by%20The%20Kissinger%20Twins' target='popup'>
						<button className='large-twitter-button end-icon' />
					</a>
				</div>
			</div>
		)
	},
	handleFacebook: function(evt) {
		FB.ui({
			method: 'feed',
			link: 'http://www.harpersbazaar.com.sg/screamsaver',
			description: 'Harper\'s BAZAAR SG & BSL present: Scream Saver, an interactive Halloween film by The Kissinger Twins',
		});
	},
	handleRestart: function() {
		dispatcher.dispatch({ type: 'goto', step: 'fade2' });
	},
});

App.Overlay = React.createClass({
	render: function() {
		let showCredits = this.props.showCredits;
		let showCreditsButton = this.props.step == 'win' || this.props.step == 'lose';
		return (
			<div className={cx('overlay flex one container', this.props.showInner && 'overlay--active')}>
				<div className={cx('overlay-credits-container flex one container justify-center align-center', showCredits && 'show-credits')}>
					<div className='overlay-credits-inner'>
						<img className='overlay-credits-title' src='images/credits.png' />
						<br/>
						<br/>
						<h2 className='credits-subtitle text-center'>Cast</h2>
						<br/>
						<table className='credits-table'>
							<tbody>
								<tr>
									<td className='credits-role'>GIRL</td>
									<td className='credits-name'>Darina Kravchenko / Mannequin</td>
								</tr>
								<tr>
									<td className='credits-role'>BEAST</td>
									<td className='credits-name'>Mario Adrion / Mannequin</td>
								</tr>
							</tbody>
						</table>
						<br/>
						<h2 className='credits-subtitle text-center'>Black Sheep Live</h2>
						<br/>
						<table className='credits-table'>
							<tbody>
								<tr>
									<td className='credits-role'>LIVE & INTERACTIVE DIRECTION</td>
									<td className='credits-name'>The Kissinger Twins</td>
								</tr>
								<tr>
									<td className='credits-role'>EXECUTIVE PRODUCER</td>
									<td className='credits-name'>Vanessa Hurst</td>
								</tr>
								<tr>
									<td className='credits-role'>DOP</td>
									<td className='credits-name'>Zoltan Halmagyi</td>
								</tr>
								<tr>
									<td className='credits-role'>PRODUCER</td>
									<td className='credits-name'>Ray Chia</td>
								</tr>
								<tr>
									<td className='credits-role'>DEVELOPER</td>
									<td className='credits-name'>Jacky Boen</td>
								</tr>
								<tr>
									<td className='credits-role'>DESIGNER</td>
									<td className='credits-name'>Zac Ong</td>
								</tr>
								<tr>
									<td className='credits-role'>COPYWRITER</td>
									<td className='credits-name'>Nikhil Panjwani</td>
								</tr>
								<tr>
									<td className='credits-role'>PA</td>
									<td className='credits-name'>Nicole Quek</td>
								</tr>
								<tr>
									<td className='credits-role'>MUSIC</td>
									<td className='credits-name'>Filip Marcinkowski</td>
								</tr>
							</tbody>
						</table>
						<br/>
						<h2 className='credits-subtitle text-center'>Harper&#39;s Bazaar</h2>
						<br/>
						<table className='credits-table'>
							<tbody>
								<tr>
									<td className='credits-role'>STYLIST</td>
									<td className='credits-name'>Windy Aulia</td>
								</tr>
								<tr>
									<td className='credits-role'>HAIR</td>
									<td className='credits-name'>John Lee / FAC4INC</td>
								</tr>
								<tr>
									<td className='credits-role'>MAKEUP</td>
									<td className='credits-name'>Cheryl Ow</td>
								</tr>
								<tr>
									<td className='credits-role'>ASSISTANT STYLISTS</td>
									<td className='credits-name'>Debby Kwong</td>
								</tr>
								<tr>
									<td className='credits-role'></td>
									<td className='credits-name'>Pakkee Tan</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div className={cx('close-credits-container container', showCredits && 'show-credits')}>
					<div className='close-credits-button' onClick={this.handleCloseCredits} />
				</div>
				<div className={cx('flex one container justify-end align-end', showCredits && 'credits-hide')}>
					<button className='credits-button' onClick={this.handleCredits}></button>
				</div>
				<div className={cx('flex one container justify-start align-end', showCredits && 'credits-hide')}>
					<button className='facebook-button' onClick={this.handleFacebook}></button>
					<a className='twitter-button' href='http://twitter.com/share?text=Harper%27s%20BAZAAR%20SG%20%26%20BSL%20present%3A%20Scream%20Saver%2C%20an%20interactive%20Halloween%20film%20by%20The%20Kissinger%20Twins' target='popup'></a>
				</div>
				<div className={cx('flex one container justify-end', showCredits && 'credits-hide')}>
					<button className={cx(this.props.audio ? 'on-audio-button' : 'off-audio-button', 'pointer-events')} onClick={this.handleAudio}></button>
					<button className='fullscreen-button' onClick={this.handleFullscreen}></button>
				</div>
			</div>
		)
	},
	getInitialState: function() {
		return { fullscreen: false };
	},
	handleCredits: function(evt) {
		dispatcher.dispatch({ type: 'showCredits' });
	},
	handleFullscreen: function(evt) {
		let fullscreen = this.state.fullscreen;
		if (screenfull.enabled) {
			screenfull.toggle();
			this.setState({ fullscreen: !fullscreen });
		}
	},
	handleCloseCredits: function(evt) {
		dispatcher.dispatch({ type: 'hideCredits' });
	},
	handleCloseShare: function(evt) {
		this.setState({ showShare: false });
	},
	handleAudio: function(evt) {
		dispatcher.dispatch({ type: 'toggleAudio' });
	},
	handleFacebook: function(evt) {
		FB.ui({
			method: 'feed',
			link: 'http://www.harpersbazaar.com.sg/screamsaver',
			description: 'Harper\'s BAZAAR SG & BSL present: Scream Saver, an interactive Halloween film by The Kissinger Twins',
		});
	},
});

App.LoadingScreen = React.createClass({
	render: function() {
		let elem;

		switch (this.state.state) {
		case 0:
			elem = <img key='loader' className='loading-screen-loader' src='images/loader.gif' />;
			break;
		case 1:
			elem = <img key='loader' className='loading-screen-loader loading-screen-loader--disabled' src='images/loader.gif' />;
			break;
		case 2:
		case 4:
			elem = <img key='gate' className='loading-screen-gate loading-screen-gate--disabled' src='images/TheScreamSaver_Gate.jpg' />;
			break;
		case 3:
			elem = <img key='gate' className='loading-screen-gate' src='images/TheScreamSaver_Gate.jpg' />;
			break;
		}


		return (
			<div className={cx('loading-screen flex one container', this.props.loaded >= 3 && 'loading-screen--disabled')}>
				<div className='container flex one justify-center align-center'>
					{ elem }
				</div>
				<div className='flex one container justify-center align-end'>
					<img className={cx('loading-screen-preload-text', this.state.state > 0 && 'loading-screen-preload-text--disabled')} src='images/preload_text.png' />
				</div>
			</div>
		)
	},
	getInitialState: function() {
		return {
			state: 0,
			progress: 0,
		}
	},
	componentDidMount: function() {
		this.listenerID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case 'videoLoadProgress':
				this.setState({ progress: payload.progress });
				break;
			}
		}.bind(this));
	},
	componentDidUpdate: function() {
		let state = this.state.state;

		switch (state) {
		case 0:
			if (this.props.loaded >= 2) {
				setTimeout(function() {
					this.setState({ state: 1 });
				}.bind(this), 2000);
			}
			break;
		case 1:
			setTimeout(function() {
				this.setState({ state: 2 });
			}.bind(this), 1000);
			break;
		case 2:
			setTimeout(function() {
				this.setState({ state: 3 });
			}.bind(this), 1000);
			break;
		case 3:
			setTimeout(function() {
				this.setState({ state: 4 });
			}.bind(this), 3000);
			break;
		case 4:
			setTimeout(function() {
				dispatcher.dispatch({ type: 'copyLoaded' });
				this.setState({ state: 5 });
			}.bind(this), 1000);
		}
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.listenerID);
	},
});

let Unsupported = React.createClass({
	render: function() {
		return (
			<div className='unsupported flex one container justify-center align-center'>
				<h1 className='unsupported-text'>
					Sorry.. your browser doesn&#39;t have the required feature to view this website :(
				</h1>
			</div>
		)
	},
});

function m(a, b, c) {
	a = a ? a : {};
	b = b ? b : {};
	c = c ? c : {};
	let ab = update(a, { $merge: b })
	return update(ab, { $merge: c });
}

function hasGetUserMedia() {
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
	return !!navigator.getUserMedia;
}

if (hasGetUserMedia()) {
	window.addEventListener('keyup', function(event) {
		event.preventDefault();
		event.stopPropagation();
	});

	ReactDOM.render(<App />, document.getElementById('root'));
} else {
	ReactDOM.render(<Unsupported />, document.getElementById('root'));
}
