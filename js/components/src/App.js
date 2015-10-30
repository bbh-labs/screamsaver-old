var React = require('react');
var ReactDOM = require('react-dom');
var Flux = require('flux');
var update = require('react-addons-update');
var videojs = require('video.js');
var screenfull = require('screenfull');

var dispatcher = new Flux.Dispatcher();

var STATE_IDLE = 0,
    STATE_BEGINNING = 1,
    STATE_PLAYING   = 2,
    STATE_WIN = 3,
    STATE_LOSE = 4;

var App = React.createClass({
	render: function() {
		var loaded = this.state.loaded;
		return (
			<div>
				<App.Audio ref='audio' />
				<App.Content ref='content' {...this.state} />
				<App.Overlay ref='overlay' {...this.state} />
				<App.LoadingScreen loaded={loaded} />
			</div>
		)
	},
	getInitialState: function() {
		return { loaded: false, step: '', showInner: false, showScreamNow: false };
	},
	componentDidMount: function() {
		this.listenerID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case 'goto':
				this.setState({ step: payload.step });
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
});

App.Audio = React.createClass({
	render: function() {
		return (
			<audio autoPlay loop>
				<source src='audio.ogg' type='audio/ogg' />
				<source src='audio.mp3' type='audio/mpeg' />
				<source src='audio.wav' type='audio/wave' />
				<source src='audio.wav' type='audio/x-wav' />
				<source src='audio.flac' type='audio/flac' />
			</audio>
		)
	},
})

App.Content = React.createClass({
	render: function() {
		return (
			<div style={this.styles.container}>
				<App.Content.MainPage { ...this.props } />
				<App.Content.Instruction { ...this.props } />
				<App.Content.Fade { ...this.props } />
				<App.Content.Game { ...this.props } />
				<App.Content.End { ...this.props } />
			</div>
		)
	},
	styles: {
		container: {
			position: 'absolute',
			width: '100%',
			height: '100%',
		},
		inner: {
			position: 'absolute',
			width: '100%',
			height: '100%',
		},
	},
});

App.Content.MainPage = React.createClass({
	render: function() {
		var showInner = this.props.showInner;
		return (
			<div style={m(this.styles.container, this.props.step == 'mainpage' && this.styles.show)}>
				<div className='valign-container' style={m(this.styles.inner, showInner && this.styles.showInner)}>
					<div className='valign-top text-center'>
						<h2>Harper&#39;s Bazaar<br/>Presents</h2>
					</div>
				</div>
				<div className='valign-container' style={m(this.styles.inner, showInner && this.styles.showInner)}>
					<div className='valign text-center'>
						<h1>The Scream Saver</h1>
						<h2>Interactive Film by Kissinger Twins</h2>
					</div>
				</div>
				<div className='valign-container' style={m(this.styles.inner, showInner && this.styles.showInner)}>
					<div className='valign-bottom text-center'>
						<button onClick={this.handleStart}>START ></button>
						<h2>Produced by BSL</h2>
					</div>
				</div>
			</div>
		)
	},
	styles: {
		container: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			transition: 'opacity 1s',
			opacity: 0,
			pointerEvents: 'none',
			background: 'url(home.jpg) center / cover',
		},
		inner: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			opacity: 0,
			transition: 'opacity 2s',
		},
		show: {
			opacity: 1,
			pointerEvents: 'auto',
		},
		showInner: {
			opacity: 1,
		},
	},
	handleStart: function(event) {
		event.preventDefault();
		dispatcher.dispatch({ type: 'goto', step: 'instruction' });
	},
});

App.Content.Instruction = React.createClass({
	render: function() {
		return (
			<div style={m(this.styles.container, this.props.step == 'instruction' && this.styles.show)}>
				<div className='valign-container' style={this.styles.inner}>
					<div className='valign text-center'>
						<h2>Instruction Copy</h2>
					</div>
				</div>
				<div className='valign-container' style={this.styles.inner}>
					<div className='valign-bottom text-center'>
						<button onClick={this.handleGo}>GO! ></button>
					</div>
				</div>
			</div>
		)
	},
	styles: {
		container: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			opacity: 0,
			transition: 'opacity .2s, background .2s',
			pointerEvents: 'none',
			background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(home.jpg) center / cover',
		},
		inner: {
			position: 'absolute',
			width: '100%',
			height: '100%',
		},
		show: {
			opacity: 1,
			pointerEvents: 'auto',
		},
	},
	handleGo: function() {
		dispatcher.dispatch({ type: 'goto', step: 'fade' });
	},
});

App.Content.Fade = React.createClass({
	render: function() {
		return (
			<div style={m(this.styles.container, this.props.step == 'fade' && this.styles.show)}>
			</div>
		)
	},
	styles: {
		container: {
			background: 'black',
			opacity: 0,
			transition: 'opacity 1s',
		},
		show: {
			opacity: 1,
		},
	},
	componentDidUpdate: function() {
		if (this.props.step == 'fade') {
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
		var showScreamNow = this.props.showScreamNow;
		return (
			<div style={m(this.styles.container, this.props.step == 'game' && this.styles.show)}>
				<video ref='video' className='video-js vjs-default-skin' width='100%' height='100%' style={this.styles.inner}>
					<source src='video.mp4' type='video/mp4' />
					<source src='video.webm' type='video/webm' />
				</video>
				<div className='valign-container' style={m(this.styles.screamNow, showScreamNow && this.styles.showScreamNow)}>
					<div className='valign-top'>
						<h2>Scream Now!</h2>
					</div>
				</div>
			</div>
		)
	},
	ACCEL: 0.033,
	sensitivity: 0.5,
	speed: 1,
	styles: {
		container: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			opacity: 0,
			transition: 'opacity .2s',
			pointerEvents: 'none',
		},
		inner: {
			position: 'absolute',
			width: '100%',
			height: '100%',
		},
		screamNow: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			opacity: 0,
		},
		show: {
			opacity: 1,
		},
		showScreamNow: {
			opacity: 1,
		},
	},
	getInitialState: function() {
		return { game: STATE_IDLE }
	},
	componentDidMount: function() {
		this.video = videojs(this.refs.video, {controls: false, preload: 'auto', techOrder: [ 'html5', 'flash' ] }, function() {
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
					'optional': [],
				},
			}, this.onMicrophoneReady, function(err) {
				alert('User blocked live input :(');
				return;
			});

			var storedSensitivity = localStorage.getItem('sensitivity');
			var storedSpeed = localStorage.getItem('speed');
			if (storedSensitivity) {
				//this.sensitivity = storedSensitivity;
				//this.refs.settings.sensitivity((this.sensitivity * 100).toFixed(0));
				this.sensitivity = 0.6;
			}
			if (storedSpeed) {
				//this.speed = storedSpeed;
				//this.refs.settings.speed((this.speed * 100).toFixed(0));
			}

			this.listenerID = dispatcher.register(function(payload) {
				switch (payload.type) {
				case 'sensitivityChanged':
					this.sensitivity = payload.sensitivity / 100;
					localStorage.setItem('sensitivity', this.sensitivity);
					break;
				case 'speedChanged':
					this.speed = payload.speed / 100;
					localStorage.setItem('speed', this.speed);
					break;
				}
			}.bind(this));

			this.start();
		}.bind(this));
	},
	componentDidUpdate: function() {
		if (this.state.game == STATE_IDLE && this.props.step == 'game') {
			this.setState({ game: STATE_BEGINNING });
		}
	},
	componentWillUnmount: function() {
		this.video = null;
		dispatcher.unregister(this.listenerID);
	},
	onMicrophoneReady: function(stream) {
		// Initialize Web Audio
		try {
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			this.audioContext = new AudioContext();
		} catch(e) {
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

		this.init();
	},
	init: function() {
		this.video.load();
		this.video.on('loadeddata', function(e) {
			dispatcher.dispatch({ type: 'videoLoaded' });
		}.bind(this));
	},
	draw: function() {
		requestAnimationFrame(this.draw);

		// Calc elapsed time since last loop
		var now = Date.now();
		this.elapsed = now - this.then;

		if (this.elapsed > this.fpsInterval) {
			this.then = now - (this.elapsed % this.fpsInterval);

			switch (this.state.game) {
			case STATE_IDLE:
				break;
			case STATE_BEGINNING:
				var nextTime = this.video.currentTime() + 0.033;
				this.video.currentTime(nextTime);
				if (this.video.currentTime() > 5) {
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


				var currentTime = this.video.currentTime();
				if (currentTime > 5) {
					dispatcher.dispatch({ type: 'showScreamNow' });
				} else {
					dispatcher.dispatch({ type: 'hideScreamNow' });
				}

				if (avg > this.sensitivity) {
					this.video.currentTime(currentTime - 0.033);
				} else {
					this.video.currentTime(currentTime + 0.033);
				}

				if (currentTime < 3.5) {
					this.video.currentTime(13.98);
					this.setState({ game: STATE_WIN });
					dispatcher.dispatch({ type: 'hideScreamNow' });
				} else if (currentTime >= 13.92) {
					this.video.currentTime(17.133);
					this.setState({ game: STATE_LOSE });
					dispatcher.dispatch({ type: 'hideScreamNow' });
				}
				break;
			case STATE_WIN:
				this.video.currentTime(this.video.currentTime() + this.fpsIntervalMS);
				if (this.video.currentTime() >= 17) {
					window.setTimeout(function() { this.video.currentTime(0) }.bind(this), 100);
					dispatcher.dispatch({ type: 'goto', step: 'win' });
					this.setState({ game: STATE_IDLE });
				}
				break;
			case STATE_LOSE:
				this.video.currentTime(this.video.currentTime() + this.fpsIntervalMS);
				if (this.video.currentTime() >= this.video.duration()) {
					window.setTimeout(function() { this.video.currentTime(0) }.bind(this), 100);
					dispatcher.dispatch({ type: 'goto', step: 'lose' });
					this.setState({ game: STATE_IDLE });
				}
				break;
			}
		}
	},
	start: function() {
		this.fps = 25;
		this.fpsInterval = 1000 / this.fps;
		this.fpsIntervalMS = 1 / this.fps;
		this.then = Date.now();
		this.startTime = this.then;
		this.draw();
	},
	restart: function() {
		this.video.currentTime(0);
		this.start();
	},
});

App.Content.End = React.createClass({
	render: function() {
		var step = this.props.step;
		var bShouldShow = step === 'win' || step === 'lose';
		return (
			<div style={m(this.styles.container, bShouldShow && this.styles.show)}>
				<div className='valign-container' style={this.styles.inner}>
					<div className='valign text-center'>
						<h1>{ step === 'win' ? 'Happy' : 'Unhappy' } Ending Copy</h1>
						<button onClick={this.handleRestart}>Restart</button>
						<button onClick={this.handleShare}>Share</button>
					</div>
				</div>
			</div>
		)
	},
	styles: {
		container: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			opacity: 0,
			transition: 'opacity .2s',
			pointerEvents: 'none',
		},
		inner: {
			position: 'absolute',
			width: '100%',
			height: '100%',
		},
		show: {
			opacity: 1,
			pointerEvents: 'auto',
		},
	},
	handleRestart: function() {
		dispatcher.dispatch({ type: 'goto', step: 'game' });
	},
	handleShare: function() {
		dispatcher.dispatch({ type: 'showShare' });
	},
});

App.Overlay = React.createClass({
	render: function() {
		var showCredits = this.state.showCredits;
		var showShare = this.state.showShare;
		return (
			<div className='no-pointer-events' style={m(this.styles.container, this.props.showInner && this.styles.show)}>
				<div className='valign-container' style={m(this.styles.inner, this.styles.credits, showCredits && this.styles.showCredits)}>
					<div className='valign text-center'>
						<h1>Credits</h1>
						<br/>
						<h1>Names</h1>
						<h1>Names</h1>
						<h1>Names</h1>
						<h1>Names</h1>
						<h1>...</h1>
						<br/>
						<button style={m(this.styles.closeCredits, showCredits && { pointerEvents: 'auto' })} onClick={this.handleCloseCredits}>Close</button>
					</div>
				</div>
				<div className='valign-container' style={m(this.styles.inner, this.styles.credits, showShare && this.styles.showCredits)}>
					<div className='valign text-center'>
						<h1>Share</h1>
						<br/>
						<a href='https://twitter.com/share' className='twitter-share-button pointer-events' data-url='http://screamsaver.bbhmakerlab.io' data-text='Hello, World!'>Tweet</a>
						<br/>
						<div className='fb-share-button pointer-events' data-href='http://screamsaver.bbhmakerlab.io' data-layout='button_count'></div>
						<br/>
						<button style={m(this.styles.closeCredits, showShare && { pointerEvents: 'auto' })} onClick={this.handleCloseShare}>Close</button>
					</div>
				</div>
				{/*
				<div style={this.styles.container}>
					<button onClick={this.handleSettings}>Settings</button>
				</div>
				*/}
				<div style={this.styles.inner} className='valign-container'>
					<div className='valign-bottom text-left'>
						<button className='pointer-events' style={m(this.styles.creditsButton, (this.props.step == 'win' || this.props.step == 'lose') && this.styles.showCreditsButton)} onClick={this.handleCredits}>Credits</button>
					</div>
				</div>
				<div style={this.styles.inner} className='valign-container'>
					<div className='valign-bottom text-right'>
						<button className='pointer-events' onClick={this.handleShare}>Share</button>
					</div>
				</div>
				<div style={this.styles.inner} className='text-right'>
					<button className='pointer-events' onClick={this.handleFullscreen}>{ this.state.fullscreen ? 'Exit Fullscreen' : 'Fullscreen' }</button>
					<button className='pointer-events' onClick={this.handleAudio}>{ this.state.audio ? 'Audio On' : 'Audio Off' }</button>
				</div>
			</div>
		)
	},
	styles: {
		container: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			pointerEvents: 'none',
			transition: 'opacity .2s',
			opacity: 0,
		},
		inner: {
			position: 'absolute',
			width: '100%',
			height: '100%',
		},
		show: {
			opacity: 1,
		},
		credits: {
			display: 'none',
			background: 'black',
			transition: 'opacity .3s',
			opacity: 0,
		},
		creditsButton: {
			opacity: 0,
			pointerEvents: 'none',
		},
		showCredits: {
			display: 'table',
			opacity: 1,
		},
		showCreditsButton: {
			opacity: 1,
			pointerEvents: 'auto',
		},
		closeCredits: {
			pointerEvents: 'none',
		},
	},
	getInitialState: function() {
		return { showCredits: false, showShare: false, fullscreen: false, audio: true };
	},
	componentDidMount: function() {
		this.listenerID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case 'showShare':
				this.setState({ showShare: true });
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.listenerID);
	},
	handleSettings: function(evt) {
		dispatcher.dispatch({ type: 'settings' });
	},
	handleCredits: function(evt) {
		this.setState({ showCredits: true });
	},
	handleShare: function(evt) {
		this.setState({ showShare: true });
	},
	handleFullscreen: function(evt) {
		var fullscreen = this.state.fullscreen;
		if (screenfull.enabled) {
			screenfull.toggle();
			this.setState({ fullscreen: !fullscreen });
		}
	},
	handleCloseCredits: function(evt) {
		this.setState({ showCredits: false });
	},
	handleCloseShare: function(evt) {
		this.setState({ showShare: false });
	},
	handleAudio: function(evt) {
		var audio = this.state.audio;
		this.setState({ audio: !audio });
	},
});

App.Settings = React.createClass({
	render: function() {
		return (
			<div className='text-center' style={m(this.styles.container, this.state.showSettings && this.styles.show)}>
				<div>
					<label style={this.styles.label}>Threshold</label>
					<input style={this.styles.input} ref='sensitivity' type='range' onChange={this.handleSensitivity} />
				</div>
				<div>
					<label style={this.styles.label}>Speed</label>
					<input style={this.styles.input} ref='speed' type='range' onChange={this.handleSpeed} />
				</div>
				<button onClick={this.handleClose} style={this.styles.close}>Close</button>
			</div>
		)
	},
	styles: {
		container: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			background: 'rgba(0,0,0,0.5)',
			transition: 'opacity .2s',
			display: 'none',
			opacity: 0,
		},
		show: {
			display: 'block',
			opacity: 1,
		},
		label: {
			display: 'inline-block',
			minWidth: '128px',
		},
		input: {
			width: '200px',
		},
		close: {
			margin: '16px',
		},
	},
	getInitialState: function() {
		return { showSettings: false };
	},
	componentDidMount: function() {
		this.listenerID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case 'settings':
				var showSettings = this.state.showSettings;
				this.setState({ showSettings: !showSettings });
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.listenerID);
	},
	handleClose: function(evt) {
		this.setState({ showSettings: false });
	},
	handleSensitivity: function(evt) {
		dispatcher.dispatch({ type: 'sensitivityChanged', sensitivity: evt.target.value });
	},
	handleSpeed: function(evt) {
		dispatcher.dispatch({ type: 'speedChanged', speed: evt.target.value });
	},
	sensitivity: function(value) {
		this.refs.sensitivity.value = value;
	},
	speed: function(value) {
		this.refs.speed.value = value;
	},
});

App.LoadingScreen = React.createClass({
	render: function() {
		return (
			<div style={m(this.styles.container, this.props.loaded && this.styles.hide)} className='valign-wrapper'>
				<div className='valign sk-circle' style={this.styles.spinner}>
					<div className='sk-circle1 sk-child'></div>
					<div className='sk-circle2 sk-child'></div>
					<div className='sk-circle3 sk-child'></div>
					<div className='sk-circle4 sk-child'></div>
					<div className='sk-circle5 sk-child'></div>
					<div className='sk-circle6 sk-child'></div>
					<div className='sk-circle7 sk-child'></div>
					<div className='sk-circle8 sk-child'></div>
					<div className='sk-circle9 sk-child'></div>
					<div className='sk-circle10 sk-child'></div>
					<div className='sk-circle11 sk-child'></div>
					<div className='sk-circle12 sk-child'></div>
				</div>
			</div>
		)
	},
	styles: {
		container: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			background: 'black',
			pointerEvents: 'none',
			transition: 'opacity 1s',
			opacity: 1,
		},
		spinner: {
			position: 'absolute',
			top: '50%',
			left: '50%',
			margin: '0 auto',
		},
		hide: {
			opacity: 0,
		},
	},
});

function m(a, b, c) {
	a = a ? a : {};
	b = b ? b : {};
	c = c ? c : {};
	var ab = update(a, { $merge: b })
	return update(ab, { $merge: c });
}

function hasGetUserMedia() {
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
	return !!navigator.getUserMedia;
}

ReactDOM.render(<App />, document.getElementById('root'));
