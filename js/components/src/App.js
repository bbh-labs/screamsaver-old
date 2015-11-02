var React = require('react');
var ReactDOM = require('react-dom');
var Flux = require('flux');
var screenfull = require('screenfull');
var update = require('react-addons-update');
var cx = require('classnames');

var dispatcher = new Flux.Dispatcher();

var video;
var gameAudio;
var sensitivity = 0;

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
		}.bind(this), 33);
	},
});

App.Audio = React.createClass({
	render: function() {
		return (
			<div>
				<audio ref='game' loop muted={!this.props.audio}>
					<source src='sounds/game.mp3' type='audio/mpeg' />
				</audio>
			</div>
		)
	},
	componentDidMount: function() {
		gameAudio = this.refs.game;
		window.setTimeout(function() {
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
			<div style={this.styles.container}>
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

App.Content.Background = React.createClass({
	render: function() {
		return (
			<div style={m(this.styles.container, this.props.step == 'mainpage' && this.styles.show)}>
				<img src='images/home.jpg' onLoad={this.imageLoaded} style={{display: 'none'}} />
			</div>
		)
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
			background: 'url(images/home.jpg) center / cover' ,
			opacity: 0,
		},
		show: {
			opacity: 1,
		},
	},
	imageLoaded: function(event) {
		dispatcher.dispatch({ type: 'imageLoaded' });
	},
});

App.Content.MainPage = React.createClass({
	render: function() {
		var show = this.props.step == 'mainpage';
		var showInner = this.props.showInner;
		var clickableClass = show ? 'pointer-events' : '';
		return (
			<div style={m(this.styles.container, show && this.styles.show)}>
				<div className='valign-container' style={m(this.styles.inner, this.styles.top, showInner && this.styles.showInner)}>
					<div className='valign-top text-center'>
						<div className='harpersbazaar' />
						<div className='presents' />
					</div>
				</div>
				<div className='valign-container' style={m(this.styles.inner, this.styles.mid, showInner && this.styles.showInner)}>
					<div className='valign text-center'>
						<img src='images/main_title.png' style={this.styles.title} />
						<h2 style={this.styles.subtitle}>A Halloween Interactive Film by The Kissinger Twins</h2>
						<button className='btn-start' style={this.styles.start} onClick={this.handleStart}></button>
					</div>
				</div>
				<div className='valign-container no-pointer-events' style={m(this.styles.inner, this.styles.bottom, showInner && this.styles.showInner)}>
					<div className='valign-bottom text-center'>
						<a href='http://blacksheeplive.com' className={cx('blacksheeplive', clickableClass)} target='_blank' />
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
			WebkitTransition: 'opacity 1s',
			MozTransition: 'opacity 1s',
			OTransition: 'opacity 1s',
			opacity: 0,
			pointerEvents: 'none',
		},
		inner: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			opacity: 0,
			transition: 'opacity 2s',
			WebkitTransition: 'opacity 2s',
			MozTransition: 'opacity 2s',
			OTransition: 'opacity 2s',
		},
		show: {
			opacity: 1,
			pointerEvents: 'auto',
		},
		showInner: {
			opacity: 1,
		},
		title: {
			display: 'block',
			margin: '0 auto',
			width: '70%',
		},
		subtitle: {
			fontFamily: 'Avenir UltraLight',
			fontSize: '2.2vmax',
			fontWeight: 100,
			paddingTop: '1rem',
		},
		top: {
			boxSizing: 'border-box',
			paddingTop: '1.5rem',
		},
		mid: {
			boxSizing: 'border-box',
			paddingTop: '1rem',
		},
		bottom: {
			boxSizing: 'border-box',
			paddingBottom: '1rem',
		},
		start: {
			width: '4rem',
			height: '4rem',
			marginTop: '2rem',
			cursor: 'pointer',
		},
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
			<div style={m(this.styles.container, this.props.step == 'fade1' && this.styles.show)}></div>
		)
	},
	styles: {
		container: {
			background: 'black',
			opacity: 0,
			transition: 'opacity 1s',
			WebkitTransition: 'opacity 1s',
			MozTransition: 'opacity 1s',
			OTransition: 'opacity 1s',
		},
		show: {
			opacity: 1,
		},
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
			<div style={m(this.styles.container, this.props.step == 'instruction' && this.styles.show)}>
				<div className='valign-container' style={this.styles.inner}>
					<div className='valign'>
						<img src='images/instruction.png' style={this.styles.instruction}/>
					</div>
				</div>
				<div className='valign-container' style={this.styles.inner}>
					<div className='valign-bottom text-center'>
						<img src='images/instruction_belowtext.png' style={this.styles.instructionBelow}/>
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
			transition: 'opacity .2s ease-in, opacity 1s ease-out',
			WebkitTransition: 'opacity .2s ease-in, opacity 1s ease-out',
			MozTransition: 'opacity .2s ease-in, opacity 1s ease-out',
			OTransition: 'opacity .2s ease-in, opacity 1s ease-out',
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
		instruction: {
			display: 'block',
			width: '70%',
			margin: '0 auto',
		},
		instructionBelow: {
			display: 'block',
			margin: '0 auto',
			paddingBottom: '50px',
			height: '14px',
		},
	},
});

App.Content.Fade2 = React.createClass({
	render: function() {
		return <div style={m(this.styles.container, this.props.step == 'fade2' && this.styles.show)}></div>
	},
	styles: {
		container: {
			background: 'black',
			opacity: 0,
			transition: 'opacity 1s',
			WebkitTransition: 'opacity 1s',
			MozTransition: 'opacity 1s',
			OTransition: 'opacity 1s',
		},
		show: {
			opacity: 1,
		},
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
		var showScreamNow = this.props.showScreamNow;
		return (
			<div style={m(this.styles.container, this.props.step == 'game' && this.styles.show)}>
				<video ref='video' style={this.styles.video} preload='auto' muted={!this.props.audio} volume={0.1}>
					<source src='videos/video.mp4' type='video/mp4' />
					<source src='videos/video.ogv' type='video/ogg' />
				</video>
				<div className='valign-container' style={m(this.styles.screamNow, showScreamNow && this.styles.showScreamNow)}>
					<div className='valign-top'>
						<img src='images/scream_now.gif' width='100px' style={this.styles.image} />
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
			transition: 'opacity 1s',
			WebkitTransition: 'opacity 1s',
			MozTransition: 'opacity 1s',
			OTransition: 'opacity 1s',
			pointerEvents: 'none',
		},
		video: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			objectFit: 'cover',
		},
		screamNow: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			opacity: 0,
			transition: 'opacity .4s',
			WebkitTransition: 'opacity .4s',
			MozTransition: 'opacity .4s',
			OTransition: 'opacity .4s',
		},
		image: {
			marginTop: '16px',
			marginLeft: '16px',
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
			}, function(stream) {
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
			this.then = now - (this.elapsed % this.fpsInterval);

			switch (this.state.game) {
			case STATE_IDLE:
				break;
			case STATE_BEGINNING:
				if (sensitivity == 0) {
					sensitivity = avg;
				} else {
					sensitivity = (sensitivity + avg) / 2;
				}
				if (video.currentTime > 7) {
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

				if (avg > sensitivity + 0.08) {
					if (avg != this.prevAvg) {
						video.pause();
						video.playbackRate = 0;
					}
					video.currentTime = video.currentTime - this.fpsIntervalSec;
				} else {
					if (avg != this.prevAvg) {
						video.playbackRate = 1;
						video.play();
					}
				}
				this.prevAvg = avg;

				if (video.currentTime < 5) {
					video.currentTime = 38.8;
					this.props.fadeAudio(-2);
					this.setState({ game: STATE_WIN });
					dispatcher.dispatch({ type: 'hideScreamNow' });
				} else if (video.currentTime > 18.16) {
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
				if (video.currentTime >= 38) {
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
		var step = this.props.step;
		var bShouldShow = step === 'win' || step === 'lose';
		var iconStyle = m(this.styles.image, bShouldShow && { pointerEvent: 'auto', cursor: 'pointer' });
		return (
			<div id='end' style={m(this.styles.container, bShouldShow && this.styles.show, this.props.showCredits && this.styles.none)}>
				<div className='valign-container' style={this.styles.inner}>
					<div className='valign text-center'>
						<img src={step == 'win'  ? 'images/happy_ending.png' :
							  step == 'lose' ? 'images/unhappy_ending.png' :
							  		   this.props.endingText} style={this.styles.endingText} />
						<button className='btn-restart-large' style={iconStyle} onClick={this.handleRestart}></button>
						<button className='btn-facebook-large' style={iconStyle} onClick={this.handleFacebook}></button>
						<a href={'http://twitter.com/share?text=' + encodeURI('Harper\'s BAZAAR SG & BSL present: Scream Saver, an interactive Halloween film by The Kissinger Twins')} target='popup'>
							<button className='btn-twitter-large' style={iconStyle} />
						</a>
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
			transition: 'opacity 1s',
			WebkitTransition: 'opacity 1s',
			MozTransition: 'opacity 1s',
			OTransition: 'opacity 1s',
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
		none: {
			display: 'none',
		},
		image: {
			width: '48px',
			margin: '0 16px',
		},
		endingText: {
			width: '70%',
			display: 'block',
			margin: '40px auto',
		},
	},
	handleFacebook: function() {
		FB.ui({
			method: 'feed',
			link: 'http://harpersbazaar.com.sg/screamsaver',
			description: 'Harper\'s BAZAAR SG & BSL present: Scream Saver, an interactive Halloween film by The Kissinger Twins',
		});
	},
	handleRestart: function() {
		dispatcher.dispatch({ type: 'goto', step: 'fade2' });
	},
});

App.Overlay = React.createClass({
	render: function() {
		var showCredits = this.props.showCredits;
		var hideStyle = showCredits && this.styles.hide;
		var creditsButtonStyle = showCredits ? 'pointer-events' : '';
		return (
			<div className='no-pointer-events' style={m(this.styles.container, this.props.showInner && this.styles.show)}>
				<div className='valign-container' style={m(this.styles.inner, this.styles.creditsContainer, showCredits && this.styles.showCredits)}>
					<div className='valign text-center' style={this.styles.creditsInner}>
						<img src='images/credits.png' style={this.styles.creditsTitle} />
						<br/>
						<br/>
						<h2 className='credits-subtitle'>Cast</h2>
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
						<h2 className='credits-subtitle'>Black Sheep Live</h2>
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
						<h2 className='credits-subtitle'>Harper&#39;s Bazaar</h2>
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
				<div style={m(this.styles.inner, this.styles.closeCreditsContainer, showCredits && this.styles.showCredits)}>
					<div className={cx('btn-close', creditsButtonStyle)} style={this.styles.closeCredits} onClick={this.handleCloseCredits} />
				</div>
				<div style={m(this.styles.inner, hideStyle)} className='valign-container'>
					<div className='valign-bottom text-right'>
						<button className={cx('btn-credits', creditsButtonStyle)} style={m((this.props.step == 'win' || this.props.step == 'lose') && this.styles.showCreditsButton)} onClick={this.handleCredits}></button>
					</div>
				</div>
				<div style={m(this.styles.inner, hideStyle)} className='valign-container'>
					<div className='valign-bottom text-left'>
						<button className='btn-facebook pointer-events' style={this.styles.facebook} onClick={this.handleFacebook}></button>
						<a className='btn-twitter pointer-events' href={'http://twitter.com/share?text=' + encodeURI('Harper\'s BAZAAR SG & BSL present: Scream Saver, an interactive Halloween film by The Kissinger Twins')} target='popup'></a>
					</div>
				</div>
				<div style={m(this.styles.inner, hideStyle)} className='text-right'>
					<button className={cx(this.props.audio ? 'btn-audio-on' : 'btn-audio-off', 'pointer-events')} style={this.styles.audio} onClick={this.handleAudio}></button>
					<button className='btn-fullscreen pointer-events' style={this.styles.fullscreen} onClick={this.handleFullscreen}></button>
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
			WebkitTransition: 'opacity .2s',
			MozTransition: 'opacity .2s',
			OTransition: 'opacity .2s',
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
		creditsContainer: {
			display: 'none',
			background: 'black',
			transition: 'opacity .3s',
			WebkitTransition: 'opacity .3s',
			MozTransition: 'opacity .3s',
			OTransition: 'opacity .3s',
			opacity: 0,
		},
		creditsInner: {
			position: 'relative',
			margin: '0 auto',
			height: '100%',
			padding: '16px',
			overflowY: 'auto',
		},
		creditsTitle: {
			maxHeight: '3.5rem',
			marginTop: '20px',
			marginBottom: '20px',
		},
		showCredits: {
			display: 'table',
			opacity: 1,
		},
		showCreditsButton: {
			opacity: 1,
			pointerEvents: 'auto',
		},
		closeCreditsContainer: {
			display: 'none',
			transition: 'opacity .3s',
			WebkitTransition: 'opacity .3s',
			MozTransition: 'opacity .3s',
			OTransition: 'opacity .3s',
			opacity: 0,
		},
		closeCredits: {
			position: 'absolute',
			display: 'inline-block',
			cursor: 'pointer',
			pointerEvents: 'none',
		},
		hide: {
			display: 'none',
			pointerEvents: 'none',
		},
	},
	getInitialState: function() {
		return { fullscreen: false };
	},
	handleCredits: function(evt) {
		dispatcher.dispatch({ type: 'showCredits' });
	},
	handleFullscreen: function(evt) {
		var fullscreen = this.state.fullscreen;
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
			link: 'http://harpersbazaar.com.sg/screamsaver',
			description: 'Harper\'s BAZAAR SG & BSL present: Scream Saver, an interactive Halloween film by The Kissinger Twins',
		});
	},
});

App.LoadingScreen = React.createClass({
	render: function() {
		return (
			<div id='loading-screen' className='valign-container' style={m(this.styles.container, this.props.loaded >= 2 && this.styles.hide)}>
				<div className='valign-container' style={this.styles.inner}>
					<div className='valign text-center'>
						<img src='images/loader.gif' style={this.styles.loader} />
					</div>
				</div>
				<div className='valign-container' style={this.styles.inner}>
					<div className='valign-bottom text-center'>
						<img src='images/preload_text.png' style={this.styles.preloadText} />
					</div>
				</div>
			</div>
		)
	},
	styles: {
		container: {
			display: 'flex',
			position: 'absolute',
			width: '100%',
			height: '100%',
			background: 'black',
			pointerEvents: 'none',
			transition: 'opacity 1s',
			WebkitTransition: 'opacity 1s',
			MozTransition: 'opacity 1s',
			OTransition: 'opacity 1s',
			opacity: 1,
		},
		inner: {
			position: 'absolute',
			width: '100%',
			height: '100%',
		},
		hide: {
			opacity: 0,
		},
		loader: {
			display: 'block',
			margin: '0 auto',
			width: '64px',
			height: '64px',
		},
		preloadText: {
			height: '17px',
			marginTop: '16px',
			paddingBottom: '16px',
		},
	},
});

var Unsupported = React.createClass({
	render: function() {
		return (
			<div className='valign-container' style={this.styles.container}>
				<div className='valign text-center'>
					<h1 style={this.styles.text}>Sorry.. your browser doesn&#39;t have the required feature to view this website :(</h1>
				</div>
			</div>
		)
	},
	styles: {
		container: {
			width: '100%',
			height: '100%',
		},
		text: {
			display: 'block',
			margin: '0 auto',
			width: '80%',
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

if (hasGetUserMedia()) {
	ReactDOM.render(<App />, document.getElementById('root'));
} else {
	ReactDOM.render(<Unsupported />, document.getElementById('root'));
}
