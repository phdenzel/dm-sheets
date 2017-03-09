# Dark matter sheets

A simple animation of the evolution of dark matter sheets in a 1D universe.

### How to run the animation

I used `jekyll` (<https://jekyllrb.com/>) to pre-compile the source code.
Once installed, move into this git repository and run: 

```bash
jekyll serve --watch
```
 to set up local server (default is 9999).
 Then open your browser (tried on Chrome and Firefox) and type http://localhost:9999/ to connect to the server.
 
 Of course, if preferred, you can set up a local server by any other means, e.g. node.js. If this is the case, use the pre-compiled `_site` folder.
 
### Where to find the physics

The module simulating the physics is found in `assets/js/phase-space.js`
