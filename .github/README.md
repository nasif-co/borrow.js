# borrow.js 📦
An open source plug-and-play javascript library that passes data from JS to CSS in order to facilitate designing user interface interactions with HTML/CSS only. It is called borrow.js since it *borrows* functionalities from javascript and presents them in a simple manner to be used inside CSS.

It is meant to allow beginner web coders to have access to many of the creative functionalities that only javascript offers (i.e. mouse position, device orientation, scroll position etc…) directly from the basic languages of the web: HTML and CSS. This way, creatives can go further with what they know before diving into learning javascript.

Apart from beginners, this library could also allow more experienced web developers to quickly sketch out ideas from HTML and CSS, without having to jump to JS from the get-go. 

## Getting started
To use borrow.js, simply include the following line inside your html `<head>`:
```html
<script src="https://nasif-co.github.io/borrow.js/borrow.min.js"></script>
```
All set!

## Using borrow.js
This library extends CSS by providing data from js directly to be used in CSS. This is done in two ways:
- **Attributes:** By dynamically adding html attributes and modifying their values. For example, adding a `data-load-state` attribute with values like 'loading', 'failed' or 'complete'.
- **Custom Properties (Variables):** By dynamically adding css variables and modifying their values to be used alongside css properties. For example, the variable `--mouse-x` holds the current position of x on screen between 0 and 1.

**Attributes** are meant to be used with the [CSS attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors). They allow to style an element based on a current requirement it is fulfilling at this moment, in a [discrete manner](https://en.wikipedia.org/wiki/Discrete_system#:~:text=In%20theoretical%20computer%20science%2C%20a,also%20be%20called%20analog%20systems.). For example, you could style an element differently depending on if it has loaded or not:
```css
img {
  opacity: 0; /* All images are initially transparent */
  transition: opacity 0.5s; /* Smooth transition of 0.5s when image loads */
}

img[data-load-state="complete"] {
  opacity: 1; /* Images that have loaded are opaque */
}
```

**Custom properties**, instead, are meant to be used inside a CSS rule, and allow a more fluid or [continuous/analog](https://en.wikipedia.org/wiki/Analog_device) way to use data. For example, you may use it together with `calc()` to position an image based on the mouse X position:
```css
img {
  position: absolute;
  width: 50px;
  height: auto;
  top: 30px;
  left: calc( var(--mouse-x)*100vw - 25px );
  /* --mouse-x is always between 0 and 1. We multiply by 100vw to make it
  cover the whole width of the window. Then we subtract half the width of the image
  so that the image is centered on the mouse. */
}
```

## Functionalities
Here is a reference of the functionalities offered by the library, grouped by topic.
### Mouse
**Attributes**
- **Click toggle** `[data-mouse-state]`: Each time an element is clicked, the body toggles this attribute from not being available, to having the value 'mouse-toggled'.
- **Click counter** `[data-click-count]`: Every element gets its own click counter. Everytime a left click is done over an element, the value in this attribute is increased by one.

**Custom properties**
- **Mouse Position** `--mouse-x` & `--mouse-y`: These hold the normalized cursor coordinates in x and y with respect to the window. This means they are always between 0 and 1, but can be modified using `calc()` to give them any range.

### URL
**Attributes**
- **Current hash** `[data-hash]`: This attribute is placed on the body and its value always holds the current url hash (text after '#' in the url). With it, url hashes can be used as states to create a onepage site with multiple states changed by clicking local links with different hashes.

### Scroll
**Attributes**
- **Scroll Depth Sections** `[data-scroll-depth-x]` & `[data-scroll-depth-y]`: These are set on the body and contain the percentages of scroll the user has passed (in x and y) in intervals of 10. Meaning that is a user has scrolled past 50% vertically, the attribute would look like this: `data-scroll-depth-y="10 20 30 40 50"`. This allows styling based on discrete sections of scroll using attribute selectors.

**Custom Properties**
- **Normalized Scroll Depth** `--scroll-depth-y` & `--scroll-depth-x`: Also defined in the body, these variables hold the exact scroll position in x and y, normalized between 0 and 1. They can be used together with `calc()` to transform them into any usable range of numeric values.

### Load Events
**Attributes**
- **Load state** `[data-load-state]`: This attribute is added to the body (for full page load) and to each replaced element that has its own load events (for now only imgs and iframes). Its value holds either 'complete', 'loading' or 'failed', and is dynamically updated if the load state changes.

### Device Acceleration
**Attributes**
- **Discrete acceleration level** `[data-acceleration-x]`, `[data-acceleration-y]` & `[data-acceleration-z]`: Attributes added to the html body. These hold a discrete value describing the acceleration in each axis. The first part of the value is either 'negative' or 'positive', describing the direction of acceleration in the axis. This is followed by a space and then a discrete state of acceleration between, 'low', 'low-mid', 'mid', 'mid-high' or 'high'. For example `data-acceleration-x="positive high"`.

**Custom Properties**
- **Normalized acceleration values** `--acceleration-x`, `--acceleration-y` & `--acceleration-z`: These properties are added to the body and each of them holds the current normalized value of acceleration for its respective axis, between -1 and 1. This can be used together with `calc()` to convert it into any usable range of values for css.

*This functionality is **only** available at the moment in Android devices, as iOS requires permission to be granted before a website may use orientation and motion data. Asking for permission to allow functionality in iOS in under development*

### Device Rotation
**Custom Properties**
- **Normalized rotation values** `--rotation-x`, `--rotation-y` & `--rotation-z`: These properties are added to the body and each of them holds the current normalized value of rotation for its respective axis. This means that, as the device is rotated, each angle represents one specific value. For x, these values are between -0.5 to 0.5. For y between -0.25 to 0.25, and for Z between 0 and 1.
- **Continuous rotation value** `--cont-rotation-x`, `--cont-rotation-y` & `--cont-rotation-z`: These properties are added to the body and each of them hold the current continuous or additive rotation for each respective axis. This means that, as the device is rotated, any angle of rotation is represented by its infinite multiples. ie. 0°, 360°, 720°...360°*n all represent the same angle the device is at. As such, this values (given in unitless degrees) allows you to know not only the angle of the device but also how many times it has been rotated over each axis to create continuous rotation interactions.

*This functionality is **only** available at the moment in Android devices, as iOS requires permission to be granted before a website may use orientation and motion data. Asking for permission to allow functionality in iOS in under development*

### Keyboard
**Attributes**
- **Pressed Keys** `[data-active-keys]`: Added to the body. It hold a list of all keys currently being held down separated by spaces. ie: `data-active-keys="Digit4 KeyR KeyF Space ShiftLeft"`.
- **Toggled Keys** `[data-toggled-keys]`: Added to the body. It holds a space-separated list of keys that are toggled on. This means that if a key is pressed, it is added to the list until it is pressed again, removing it from the list.

### Network status
**Attributes**
- **Current network status** `[data-network-status]`: Added to the body. It contains the current connection status of the user, either 'online' or 'offline', allowing to style the page differently in each state.

### Language
**Attributes**
- **Navigator language ISO code** `[data-language]`: Added to the body. It contains the ISO code for the user interface language reported by the browser.

## Gotchas
These functionalities must be used in a stylesheet linked to the HTML document the library was added to. They will not always work when used as inline styles or in an inspector stylesheet.

This is due to how the library loads the functionalities. Because of how many there are, loading and running all of them for every site using the library would make them sluggish. As such, the library works by checking all the loaded stylesheets, finding all references to the library's functionalities inside said stylesheets and then activating and running only those required functionalities.

Therefore, if a functionality is not found to be used inside one of the loaded stylesheets, then it will ***not*** be loaded, and it will not work when you try to use it from inline styles or inspector styles.

## Projects that use the library
This library has been developed initially for Web Literacy students at the BA in Design at Universidad de los Andes. As such, the projects shown here have been made in that undergraduate course:
- [Snatch a Word](http://snatch-a-word-design.glitch.me/): A site exploring the etymology of spanish words in the style of body-snatching. Developed by Maria Camila Jaramillo, Melissa Gandara & Fernando Alarcón.
- [Globo](http://globito.glitch.me/): An upward-scrolling site featuring a balloon rising alongside facts of the altitudes passed. Developed by Gabriela Ramírez, Marcos Neira & Isabella Vergara
- [Ask Putin](http://ask-putin.glitch.me/): An interactive interview experience with President Putin, featuring answers generated by ChatGPT. Developed by Daniel Sarmiento, Felipe Sierra & Daniela Parra
- [Mercado Excitante](http://mercado-excitante.glitch.me/): A 2.5D website, scrolling down a supermarket aisle and hovering over products to learn about their health effects. Developed by Diego Tamayo, Daniela Nieto & Diego Oviedo.
- [Código Secreto](http://codigo-secreto.glitch.me/): A seemingly counterintuitive experience in which you must take your time to scroll and read the content. Inspired on the question of how a website could stutter. Developed by Paulina Garcia, Angélica Guerrero & Valentina Perea.
- [Sujeta Tu Destino](http://sujeta-tu-destino.glitch.me/): A tarot-inspired experience where the user can pick a card and hold it to read its destiny. Developed by Alejandro Bernal, Laura Corredor & Gabriela Puentes.
