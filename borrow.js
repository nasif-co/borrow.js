/* Borrow.js
 *
 * A plug-and-play javascript library that passes data
 * from JS to CSS, in order to facilitate designing
 * user interface interactions with CSS only.
 *
 * Meant as a quick platform for Creative Coding with
 * CSS. Ideal for quick prototyping before fully
 * implementing features, making quick sketches or
 * learning to develop interactive sites before
 * venturing into javascript.
 * 
 * GNU LGPL v.2.1 License
 * By nasif.co (https://github.com/nasif-co)
 * https://github.com/nasif-co/borrow.js
 */

let borrower = {
  needs: {
    mouse: false, 						  //stable
    url: false, 							  //stable
    time: false, 							//not started
    deviceAcceleration: false,  //stable
    deviceRotation: false, 		  //stable
    keyboard: false, 					  //stable
    scroll: false,							//stable
    forms: false,							//not started
    language: false,					  //stable
    network: false,							//stable
    geolocation: false,				//not started
    load: false,								//stable
    pointerPressure: false,   //not started
    counter: false,						//not started
    random: false							//not started

		/* Future feature ideas ----------------------------*/
    //Clipboard events?
    //Ml5 models?
    //for loops/repetition?
    //Gravity with matter.js?
    //IP location with geoplugin per https://stackoverflow.com/questions/391979/how-to-get-clients-ip-address-using-javascript?
    //Implementing CSS attribute value greater-than, less-than selectors? This could allow pseudo-if-statements
    //Page visibility API https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API ?
    //Tocuh gesture events?
  },

  checkWhatToBorrow: function () {
    let stylesheets = document.styleSheets;

    let ignoredStylesheets = [];
    //From https://developer.mozilla.org/en-US/docs/Web/API/StyleSheetList#get_all_css_rules_for_the_document_using_array_methods
    const cssString = [...stylesheets]
      .map( (styleSheet) => {
        try {
          return [...styleSheet.cssRules].map( (rule) => rule.cssText ).join( "" );
        } catch ( e ) {
          ignoredStylesheets.push( styleSheet.href );
        }
      } )
      .filter( Boolean )
      .join( "\n" );

    //Notify about stylesheets not checked in this detector function
    if ( ignoredStylesheets.length > 0 ) {
      console.groupCollapsed(
        "Some stylesheets were ignored. Expand to see the complete list."
      );
      ignoredStylesheets.forEach( (href) => {
        console.log( href );
      } );
      console.groupEnd();
    }
    
		/* Activate required features -------------------------------------------------*/
		//Mouse Features
		if( cssString.includes('--mouse-') || cssString.includes('[data-mouse-state') ){
			this.borrowMouse();
		}
    
		//URL Hash Features
		if( cssString.includes('[data-hash') ){
			this.borrowURL();
		}
		
		//Device motion and orientation features
		if( cssString.includes('--acceleration') || cssString.includes('[data-acceleration') || cssString.includes('-rotation-') ){
			//Notify if any of the required features were denied because of lack of SSL
    	if ( !isSecureContext ) {
				console.warn(
					"Current connection is not on a Secure Context. This means the following features will not be available: Rotation and Acceleration.\n\nPlease make sure that your domain name does not include special characters (like '#*%'), start or end with a hyphen ('-') or exceed 255 characters (as per RFC1035 Section 2.3.4). Breaking one or more of these rules may be causing your connection to be insecure."
				);
    	}else{
				if( cssString.includes('--acceleration') || cssString.includes('[data-acceleration') ){
					this.borrowAcceleration();
				}
				
				if( cssString.includes('-rotation-') ){
					this.borrowRotation();
				}
			}
		}
		
		//Keyboard Features
		if( cssString.includes('[data-active-keys') || cssString.includes('[data-toggled-keys') ){
			this.borrowKeyboard();
		}
		
		//Scroll Features
		if( cssString.includes('--scroll-depth-') || cssString.includes('[data-scroll-depth') ){
			this.borrowScroll();
		}
    
		//Language Features
		if( cssString.includes('[data-language') ){
			this.borrowLanguage();
		}

    //Network Features
		if( cssString.includes('[data-network-status') ){
			this.borrowNetwork();
		}
		
		//Load Event Features
		if( cssString.includes('[data-load-state') ){
			this.borrowLoadEvents();
		}
  },

  borrowMouse: function () {
		/*
		 * variables: mouseX, mouseY normalizado, de 0 a 1
     * attr: mouse-pressed mouse-toggled
		
     * TO DO: Evaluate the actual need for mouse-toggled
		 */

    //Check if current media has a fine pointing device (mouse)
    if ( !window.matchMedia("(pointer: fine)").matches ) {
      return;
    }

    /* Mouse position -------------------------------------------------------------------------*/
    //Initialize at 0, 0
    borrower.globals.mousePos = { x: 0, y: 0 };
    document.body.style.setProperty( "--mouse-x", borrower.globals.mousePos.x );
    document.body.style.setProperty( "--mouse-y", borrower.globals.mousePos.y );

    const throttleLender = borrower.utils.throttle( lendMousePosition, 25 );

    window.addEventListener( "mousemove", throttleLender );

    function lendMousePosition( e ) {
      borrower.globals.mousePos.x = parseFloat(
        (e.clientX / window.innerWidth).toFixed(4)
      );
      borrower.globals.mousePos.y = parseFloat(
        (e.clientY / window.innerHeight).toFixed(4)
      );

      document.body.style.setProperty( "--mouse-x", borrower.globals.mousePos.x );
      document.body.style.setProperty( "--mouse-y", borrower.globals.mousePos.y );
    }

    /* Mouse click states --------------------------------------------------------------------*/
    //mouse-pressed class was removed because it is the same as html:active
    window.addEventListener( "mousedown", function (e) {
      if ( e.button == 0 ) {
        if ( document.body.hasAttribute("data-mouse-state") && document.body.getAttribute("data-mouse-state").includes("mouse-toggled") ) {
          document.body.removeAttribute( "data-mouse-state" );
        } else {
          document.body.setAttribute( "data-mouse-state", "mouse-toggled" );
        }
      }
    } );
  },

  borrowURL: function () {
		/*
		 * attr: url-hash
		 */
		
    //Get initial hash
    borrower.globals.urlHash = location.hash.substring(1);
    document.body.setAttribute( "data-hash", borrower.globals.urlHash );

    //Update hash
    window.addEventListener( "hashchange", function () {
      borrower.globals.urlHash = location.hash.substring( 1 );
      document.body.setAttribute( "data-hash", borrower.globals.urlHash );
    } );
  },

  borrowTime: function () {
		/*
		 * variables: hour, minute, second, time (compound normalizado de 0 a 1)
     *           elapsed-hour, elapsed-minute, elapsed-second, elapsed-time (normalizado de 0 a 1)
     * attr: hour, minute formato 00-23 y 00-59
     *       elapsed-hour, elapsed-minute
		 */
	},

  borrowAcceleration: function () {
		/*
		 * variables: accel-x, accel-y, accel-z normalizado de 0 a 1
     * attr: acceleration ranges low, low-mid, mid, mid-high, high
		 *
		 * TO DO: Currently no reliable way to check if DeviceMotion events exist without adding an event listener. For now we detect if it is a touchscreen and assume it must have the events. Must find a better solution for this
     * TO DO: Shake toggles? When shook frontward turn on a toggle that turns off next shake? Or Shake as counter?
		 */
		
		if ( window.matchMedia("(pointer: fine)").matches ) {
      return;
    }
		
		const throttleLender = borrower.utils.throttle( lendDeviceAcceleration, 25 );
		
		window.addEventListener( 'devicemotion', throttleLender );
					
		function lendDeviceAcceleration( e ){
			//Normalize assuming 100m/s2 to be maximum
			borrower.globals.deviceAcceleration = {
				x: borrower.utils.constrain( e.acceleration.x/100, -1, 1 ),
				y: borrower.utils.constrain( e.acceleration.y/100, -1, 1 ),
				z: borrower.utils.constrain( e.acceleration.z/100, -1, 1 ),
			};
			
			/* Acceleration variables ---------------------------------------------------------------*/
			document.body.style.setProperty( '--acceleration-x', borrower.globals.deviceAcceleration.x );
			document.body.style.setProperty( '--acceleration-y', borrower.globals.deviceAcceleration.y );
			document.body.style.setProperty( '--acceleration-z', borrower.globals.deviceAcceleration.z );
			
			/* Acceleration attributes --------------------------------------------------------------*/
			Object.keys( borrower.globals.deviceAcceleration ).forEach( key => {
				//console.log(key, borrower.globals.deviceAcceleration[key]);
				let accelLevel = 'low';
				if( Math.abs( borrower.globals.deviceAcceleration[key] ) < 0.2 ){
					accelLevel = 'low';
				}else if( Math.abs( borrower.globals.deviceAcceleration[key] ) < 0.4 ){
					accelLevel = 'low-mid';
				}else if( Math.abs( borrower.globals.deviceAcceleration[key] ) < 0.6 ){
					accelLevel = 'mid';
				}else if( Math.abs( borrower.globals.deviceAcceleration[key] ) < 0.8 ){
					accelLevel = 'mid-high';
				}else if( Math.abs( borrower.globals.deviceAcceleration[key] ) <= 1 ){
					accelLevel = 'high';
				}
				
				let accelDirection = 'positive';
				if( borrower.globals.deviceAcceleration[key] < 0 ){
					accelDirection = 'negative';
				}
				
				document.body.setAttribute( 'data-acceleration-' + key, accelDirection + ' ' + accelLevel );
			});
		}
		
	},

  borrowRotation: function () {
		/*
		 * variables: rotation-x, rotation-y, rotation-z de -1 a 1
     * attr: rotation ranges(?)
		 *
     * TO DO: Currently no reliable way to check if DeviceOrientation events exist without adding an event listener. For now we detect if it is a touchscreen and assume it must have the events. Must find a better solution for this
     * TO DO: Check if this works correctly on apple devices. Some information online indicates Apple requires a permission for it. https://stackoverflow.com/questions/56514116/how-do-i-get-deviceorientationevent-and-devicemotionevent-to-work-on-safari
		 * TO DO: Check different values being used in Firefox vs Safari: 
		 	 "DeviceOrientationEvent.beta has values between -90 and 90 on mobile Safari and between 180 and -180 on Firefox.
			 	DeviceOrientationEvent.gamma has values between -180 and 180 on mobile Safari and between 90 and -90 on Firefox."
		 * TO DO: Attributes for ranges of rotation? Could it be useful?
		 */
		
    if ( window.matchMedia("(pointer: fine)").matches ) {
      return;
    }

    //Initialize
    borrower.globals.deviceRotation = {
      normal: {
        x: 0,
        y: 0,
        z: 0
      },
      continuous: {
        x: 0,
        y: 0,
        z: 0
      }
    };

    let previousRotation = {
      x: 0,
      y: 0,
      z: 0
    };

    function getContinuousRotation( current, previous, continuous, minDegrees, maxDegrees ) {
      let limit = maxDegrees / 2;
      if ( Math.abs(current - previous) < limit ) {
        if ( current > previous ) {
          continuous += Math.abs( current - previous );
        } else if ( current < previous ) {
          continuous -= Math.abs( current - previous );
        }
      } else {
        //Jumped edge
        if ( previous < current ) {
          //decreasing
          continuous -= previous - minDegrees;
          continuous -= maxDegrees - current;
        } else {
          //increasing
          continuous += current - minDegrees;
          continuous += maxDegrees - previous;
        }
      }
      return continuous;
    }

    const throttleLender = borrower.utils.throttle( lendDeviceRotation, 25 );

    function lendDeviceRotation( e ) {
      previousRotation = borrower.globals.deviceRotation.normal;
      borrower.globals.deviceRotation.normal = {
        x: e.beta,
        y: e.gamma,
        z: e.alpha,
      };

      borrower.globals.deviceRotation.continuous = {
        x: getContinuousRotation(
          borrower.globals.deviceRotation.normal.x,
          previousRotation.x,
          borrower.globals.deviceRotation.continuous.x,
          -180,
          180
        ),
        y: getContinuousRotation(
          borrower.globals.deviceRotation.normal.y,
          previousRotation.y,
          borrower.globals.deviceRotation.continuous.y,
          -90,
          90
        ),
        z: getContinuousRotation(
          borrower.globals.deviceRotation.normal.z,
          previousRotation.z,
          borrower.globals.deviceRotation.continuous.z,
          0,
          360
        )
      };
			
			//Variables
      document.body.style.setProperty( '--cont-rotation-x', (borrower.globals.deviceRotation.continuous.x/360).toFixed(4) );
			document.body.style.setProperty( '--rotation-x', (borrower.globals.deviceRotation.normal.x/360).toFixed(4) );
			document.body.style.setProperty( '--cont-rotation-y', (borrower.globals.deviceRotation.continuous.y/360).toFixed(4) );
			document.body.style.setProperty( '--rotation-y', (borrower.globals.deviceRotation.normal.y/360).toFixed(4) );
			document.body.style.setProperty( '--cont-rotation-z', (borrower.globals.deviceRotation.continuous.z/360).toFixed(4) );
			document.body.style.setProperty( '--rotation-z', (borrower.globals.deviceRotation.normal.z/360).toFixed(4) );
    }

    window.addEventListener( "deviceorientation", throttleLender );
  },

  borrowKeyboard: function () {
		/*
		 * attr: keypressed, keytoggled
		 *
     * TO DO: Keys to increment/decrement counter?
     * TO DO: Report on state of modifier keys //https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/getModifierState
     * TO DO: Throttle keyboard events?
		 */

    //Initialize related global variables
    borrower.globals.pressedKeys = [];
    borrower.globals.toggledKeys = [];

    let activeKeyTimer = 0;

    window.addEventListener( "keydown", function ( e ) {
      if ( e.isComposing ) {
        return;
      }

      //Disable functionality of spacebar scrolling down on the body
      if(e.code == 'Space' && e.target == document.body) {
        e.preventDefault();
      }

      if (!e.repeat) {
        if ( ["CapsLock", "Tab"].indexOf( e.code ) == -1 && borrower.globals.pressedKeys.indexOf( e.code ) == -1 ) {
          //Active (pressed) keys
          borrower.globals.pressedKeys.push( e.code );
          document.body.setAttribute( "data-active-keys", borrower.globals.pressedKeys.join(" ") );
        }
      } else {
        clearTimeout(activeKeyTimer);
        activeKeyTimer = setTimeout(function () {
          if ( borrower.globals.pressedKeys.indexOf( e.code ) != -1 ) {
            borrower.globals.pressedKeys.splice( borrower.globals.pressedKeys.indexOf( e.code ), 1 );
            document.body.setAttribute( "data-active-keys", borrower.globals.pressedKeys.join(" ") );
          }
        }, 500);
      }
    } );

    window.addEventListener( "keyup", function ( e ) {
      if ( e.isComposing ) {
        return;
      }

      //Active (pressed) keys
      if ( borrower.globals.pressedKeys.indexOf( e.code ) != -1 ) {
        borrower.globals.pressedKeys.splice( borrower.globals.pressedKeys.indexOf( e.code ), 1 );
        document.body.setAttribute( "data-active-keys", borrower.globals.pressedKeys.join(" ") );
      }

      //Key toggle
      if ( ["CapsLock", "Tab"].indexOf( e.code ) == -1 ) {
        if ( borrower.globals.toggledKeys.indexOf( e.code ) == -1 ) {
          borrower.globals.toggledKeys.push( e.code );
        } else {
          borrower.globals.toggledKeys.splice( borrower.globals.toggledKeys.indexOf( e.code ), 1 );
        }
        document.body.setAttribute( "data-toggled-keys", borrower.globals.toggledKeys.join(" ") );
      }
    } );
  },

  borrowScroll: function () {
		/*
		 * variables: --scroll-depth-y & --scroll-depth-x (both normalized)
		 * attr: scroll depth by tens (0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100)
		 * properties: scrollTo: add to an element to allow choosing an element (by id) to scroll to, a scroll offset in <length> and how to trigger the scroll (click/dbclick/hover) 
		 *
     * TO DO: Consider also for other overflowing containers? Or only root? Allow for other containers but only turn on the javascript functions if the variable is used by a descendant of it?
		 */
		
		//Initialize variables and attributes
		borrower.globals.scrollDepth = {
			y: 0,
			x: 0,
		};
		
		const throttleLender = borrower.utils.throttle( lendScrollDepth, 25 );
		
		window.addEventListener( 'scroll', throttleLender );
		
		borrower.utils.runOnResize( lendScrollDepth );
		
		function lendScrollDepth() {
			if( window.innerHeight < document.body.scrollHeight ){
				borrower.globals.scrollDepth.y = window.scrollY/( document.body.scrollHeight - window.innerHeight );
			}else{
				borrower.globals.scrollDepth.y = 0;
			}
			if( window.innerWidth < document.body.scrollWidth ){
				borrower.globals.scrollDepth.x = window.scrollX/( document.body.scrollWidth - window.innerWidth );
			}else{
				borrower.globals.scrollDepth.x = 0;
			}

			document.body.style.setProperty( '--scroll-depth-y', borrower.globals.scrollDepth.y.toFixed(4) );
			document.body.style.setProperty( '--scroll-depth-x', borrower.globals.scrollDepth.x.toFixed(4) );
			
			const scrollDepths = getScrollDepthAttributes();
			document.body.setAttribute( 'data-scroll-depth-x', scrollDepths.x );
			document.body.setAttribute( 'data-scroll-depth-y', scrollDepths.y );
		}
		
		function getScrollDepthAttributes(){
			const availableDepthsArr = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
			const depthYTens = Math.trunc( borrower.globals.scrollDepth.y*10 );
			const depthXTens = Math.trunc( borrower.globals.scrollDepth.x*10 );
			
			const scrollDepths = {
				y: availableDepthsArr.slice( 0, depthYTens + 1 ).join(' '),
				x: availableDepthsArr.slice( 0, depthXTens + 1 ).join(' '),
			}
			
			return scrollDepths;
		}
	},

  borrowForms: function () {
		/*
		 * attr: live update of values directly on form element
		 */
	},

  borrowLanguage: function () {
		/*
		 * attr: language ISO code (navigator.language)
		 */
		
    //Get initial language
    borrower.globals.language = navigator.language;
    document.body.setAttribute( "data-language", borrower.globals.language );

    //Update if language changes
    window.addEventListener( "languagechange", function () {
      borrower.globals.language = navigator.language;
      document.body.setAttribute( "data-language", borrower.globals.language );
    } );
  },

  borrowNetwork: function () {
		/*
		 * attr: onLine (navigator.onLine)
		 */
		
    //Get initial network status
    borrower.globals.network = "online";
    if ( !navigator.onLine ) {
      borrower.globals.network = "offline";
    }
    document.body.setAttribute( "data-network-status", borrower.globals.network );

    //Update network status if it changes
    window.addEventListener( "online", function () {
      borrower.globals.network = "online";
      document.body.setAttribute(
        "data-network-status",
        borrower.globals.network
      );
    } );

    window.addEventListener( "offline", function () {
      borrower.globals.network = "offline";
      document.body.setAttribute(
        "data-network-status",
        borrower.globals.network
      );
    } );
  },

  borrowGeolocation: function () {
		/*
     * variables: latitude, longitude normalized? (navigator.geolocation)
     * https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API/Using_the_Geolocation_API
		 */
	},

  borrowLoadEvents: function () {
		/*
		 * attr: data-load-state for replaced elements, as well as global
		 *
		 * TO DO: Load events for other replaced elements like video, embed, audio, canvas and object. (It is not clear at this time if all of these offer the possibility to detect load state).
		 * TO DO: Detect when src attribute is changed to restart load state detection
     */
		
		/* Images ----------------------------------------------------------*/
		const imgs = document.querySelectorAll( 'img[src]:not([src=""])' );
		
		if( imgs != null ){
			Array.from( imgs ).forEach( (img) => {
				if( img.complete ){
					if( img.naturalHeight == 0 ){//failed load
						img.setAttribute( 'data-load-state', 'failed' );
					}else{
						img.setAttribute( 'data-load-state', 'complete' );
					}
				}else{
					img.setAttribute( 'data-load-state', 'loading' );
					img.addEventListener( 'load', function( e ){
						if( e.currentTarget.naturalHeight == 0 ){//failed load
							e.currentTarget.setAttribute( 'data-load-state', 'failed' );
						}else{
							e.currentTarget.setAttribute( 'data-load-state', 'complete' );
						}
					} );
				}
			} );
		}
		
		/* iFrames --------------------------------------------------------*/
		const iframes = document.querySelectorAll( 'iframe[src]:not([src=""])' );
		
		if( iframes != null ){
			Array.from( iframes ).forEach( (iframe) => {
				if( iframe.readyState == 'complete' ){
						iframe.setAttribute( 'data-load-state', 'complete' );
				}else{
					iframe.setAttribute( 'data-load-state', 'loading' );
					iframe.addEventListener( 'load', function( e ){
						e.currentTarget.setAttribute( 'data-load-state', 'complete' );
					} );
				}
			} );
		}
		
		/* Document -------------------------------------------------------*/
		if( document.readyState == 'complete' ){
			document.body.setAttribute( 'data-load-state', 'complete' );
		}else{
			document.body.setAttribute( 'data-load-state', 'loading' );
			window.addEventListener( 'load', function(){
				document.body.setAttribute( 'data-load-state', 'complete' );
			} );
		}
	},

  borrowPointerPressure: function () {
		/*
		 * https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
		 */
	},
	
	borrowCounter : function () {
		/*
		 * attr: counter
		 * properties: counter-update (allow incrementing/decrementing/setting counter based on click/hover/scroll/keyboard(?) triggers)
		 */
	},
	
	borrowRandom: function () {
		/*
		 * variables: random number (normalized entre -1 y 1)
     * properties: randomize (para definir que un elemento resetea el random, sea haciendo hover, click o doble click)
		 */
	},

  utils: {
    throttle: function ( cb, delay ) {
      //From https://codedamn.com/news/javascript/throttling-in-javascript
      let wait = false;
      let storedArgs = null;

      function checkStoredArgs() {
        if ( storedArgs == null ) {
          wait = false;
        } else {
          cb(...storedArgs);
          storedArgs = null;
          setTimeout( checkStoredArgs, delay );
        }
      }

      return (...args) => {
        if ( wait ) {
          storedArgs = args;
          return;
        }

        cb(...args);
        wait = true;
        setTimeout( checkStoredArgs, delay );
      };
    },

    debounce: function ( callback, wait ) {
      //From https://www.joshwcomeau.com/snippets/javascript/debounce/
      let timeoutId = null;
      return (...args) => {
        window.clearTimeout( timeoutId );
        timeoutId = window.setTimeout( () => {
          callback.apply( null, args );
        }, wait );
      };
    },
		
		runOnResize: function( callbackFunc, runOnLoad = true ) {
			if ( document.readyState === "complete" ) {
				if ( runOnLoad ) callbackFunc();
				const debouncedResize = borrower.utils.debounce( callbackFunc, 200 );
    		window.addEventListener( "resize", debouncedResize );
			} else {
				window.addEventListener( 'load', function() {
					if ( runOnLoad ) callbackFunc();
					const debouncedResize = borrower.utils.debounce( callbackFunc, 200 );
    			window.addEventListener( "resize", debouncedResize );
				} );
			}
		},
		
		runOnLoad: function( callbackFunc ) {
			if ( document.readyState === "complete" ) {
				callbackFunc();
			} else {
				window.addEventListener( 'load', function() {
					callbackFunc();
				} );
			}
		},
		
		map: function( n, start1, stop1, start2, stop2, withinBounds ) {
			//From https://github.com/processing/p5.js/blob/v1.6.0/src/math/calculation.js#L406
			const newval = ( n - start1 ) / ( stop1 - start1 ) * ( stop2 - start2 ) + start2;
			if ( !withinBounds ) {
				return newval;
			}
			if ( start2 < stop2 ) {
				return borrower.utils.constrain( newval, start2, stop2 );
			} else {
				return borrower.utils.constrain( newval, stop2, start2 );
			}
		},
		
		constrain: function( n, low, high ) {
			//From https://github.com/processing/p5.js/blob/v1.6.0/src/math/calculation.js#L71
			return Math.max( Math.min( n, high ), low );
		},
  },

  globals: {
    mousePos: null,
    pressedKeys: null,
    toggledKeys: null,
    urlHash: null,
    language: null,
    network: null,
    deviceRotation: null,
		deviceAcceleration: null,
		scrollDepth: null,
  }
};

window.addEventListener( 'load', function(){
  //TO DO: Not start on full page load, but rather as soon as all stylesheets have loaded
	borrower.checkWhatToBorrow();
} );
