/*
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Mark William Hughes
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */
 
var Mixer = Mixer || {};

Mixer._slots = [];
Mixer._collection = {};
Mixer._collection_sounds = [];

Mixer.removeStored = function (rem) {
	var workingWith = JSON.parse(localStorage.getItem("savedTracks"));
	
	workingWith.splice(rem, 1);
	
	
	localStorage.setItem("savedTracks", JSON.stringify(workingWith));
	
	// make sure we rebuild too - it's required! 
	Mixer.loadExistingTracks();
	
}

Mixer.doLoad = function(collection, trackData) {
	var options = [];
	
	options["yes"] = true;
	
	Interface.showMessage("Hi", "Your track data WAS saved.<br>I just can't load it yet!<br><br>You should be able to do this<br>in the next release.", null, options);
}


Mixer.loadExistingTracks = function() {
	var built = "<ul>";
	
	Mixer.currentI = 0;
	
	JSON.parse(localStorage.getItem("savedTracks")).forEach(function (a) {
		var splitUp = a.split("||[\/@]/@||");
		built+= "<li><a href=\"#\" onclick=\"Mixer.doLoad('"+encodeURI(splitUp[1])+"', '"+encodeURI(splitUp[2])+"');\">"+splitUp[0]+"</a> <a href=\"#\" onclick=\"Mixer.removeStored("+JSON.parse(localStorage.getItem("savedTracks")).indexOf(a)+");\" class=\"removeButton\">X</a></li>";
		console.log(a);
		Mixer.currentI++;
	});
	
	built+= "</ul>";
	
	if(Mixer.currentI ==0) {
		built = "You have no stored tracks!";
	}
	
	document.getElementById("storedTracksList").innerHTML = built;
}

Mixer.setSample = function(sample_id, slot) {
	Mixer._slots[slot] = sample_id;
}

Mixer.setCollection = function(collection) {
	var cname = collection;
	
	if     (collection == "country")	collection = SoundsLibrary.collection_country;
	else if(collection == "dance")		collection = SoundsLibrary.collection_dance;
	else if(collection == "hiphop")		collection = SoundsLibrary.collection_hiphop;
	else if(collection == "latin")		collection = SoundsLibrary.collection_latin;
	else if(collection == "pop") 		collection = SoundsLibrary.collection_pop;
	else if(collection == "rock")		collection = SoundsLibrary.collection_rock;
	else    							collection = null;
	
	Mixer._collection = collection;
	Mixer._collection_sounds = collection.sounds;
	
	document.getElementByClass("country_class").style.color	= '#000000';
	document.getElementByClass("dance_class").style.color	= '#000000';
	document.getElementByClass("hiphop_class").style.color	= '#000000';
	document.getElementByClass("latin_class").style.color	= '#000000';
	document.getElementByClass("pop_class").style.color		= '#000000';
	document.getElementByClass("rock_class").style.color	= '#000000';
	
	document.getElementByClass(cname+"_class").style.color = 'red';
	
}

Mixer.getSample = function(slot) {
	return Mixer._slots[slot];
}

Mixer.getSound = function(slot) {
	return this._collection_sounds[this._slots[slot]];
}

Mixer.getLengthInSeconds = function(slot) {
	var dur = Math.floor(this.getSound(slot).duration);
	if(dur == 8) dur = 10;
	
	return dur;
}

Mixer.getStepsLayout = function(row, size) {
	if(size == 2) {
		var str = "<img id='s_"+row+"_%i%' src='assets/images/tabs/2s_clear.png' onclick='Mixer.toggle("+row+", %i%)' alt='' width='18' height='36' selected='0'>";
		return(str.repeat(30));
	}
	
	if(size == 4) {
		var str = "<img id='s_"+row+"_%i%' src='assets/images/tabs/2s_clear.png' width='36' height='36' onclick='Mixer.toggle("+row+", %i%)' selected='0'>";
		return(str.repeat(15));
	}
	
	if(size == 10) {
		var str = "<img id='s_"+row+"_%i%' src='assets/images/tabs/2s_clear.png' width='90' height='36' onclick='Mixer.toggle("+row+", %i%)' selected='0'>"
		return(str.repeat(6));
	}
	
	return null
}

Mixer.buildBlankRows = function() {	
	var rows = '';
	
	var row_template = ''+
'			<div id="row" class="row%i% two">'+
'				<div id="leftbox">'+
'					<select id="row%i%_option" onchange="Mixer.changeSampleAtRow(%i%)">'+
'						<option value="_" selected=""></option>'+
'						OptionsReplacer'+
'					</select>'+
'				</div>'+
'				<div id="rightbox" class="rightbox-%i%"></div>'+
'			</div>';
			
	
	// First, generate the options
	var options = '';
	
	for (var key in Mixer._collection_sounds) {
		options+= '<option value="'+key+'">'+key+'</option>';
	}	
	row_template = row_template.replace(new RegExp("OptionsReplacer", 'g'), options);
	
	var i = 0;
	while(i < 6) {
		var working_row = row_template;
		rows+= working_row.replace(new RegExp("%i%", 'g'), i);
		i++;
	}
	
	document.getElementById("rows-collection").innerHTML = rows;
}

Mixer.setRow = function(row) {
	if(this._slots[row] != null && this._slots[row] != "_") {
		document.getElementByClass("rightbox-"+row).innerHTML = this.getStepsLayout(row, this.getLengthInSeconds(row));
	} else {
		document.getElementByClass("rightbox-"+row).innerHTML = '';
	}
}

Mixer.toggle = function(row, tab) {
	var tab = document.getElementById("s_"+row+"_"+tab);
	
	if(tab.getAttribute("selected") == "0") {
		tab.setAttribute("selected", "1");
		tab.setAttribute("src", "assets/images/tabs/2s_clear_enabled.png");
		
	} else {
		tab.setAttribute("selected", "0");
		tab.setAttribute("src", "assets/images/tabs/2s_clear.png");
	}
	
	StepSequence.buildSequence();
}

Mixer.changeSampleAtRow = function(row) {
	this.setSample(document.getElementById("row"+row+"_option").value, row);
	Mixer.setRow(row);
}

Mixer.playStopButton = function() {
	if(document.getElementById("playButton").getAttribute("state") == "stopped") {
		document.getElementById("playButton").setAttribute("class", "s_playing");
		document.getElementById("playButton").setAttribute("state", "playing");
		StepSequence.playTrack();
	} else {
		document.getElementById("playButton").setAttribute("src", "assets/images/play.png");
		document.getElementById("playButton").setAttribute("class", "s_stopped");
		document.getElementById("playButton").setAttribute("state", "stopped");
		StepSequence.stop();
	}
}

Mixer.clearAll = function() {
	Mixer.buildBlankRows();
	StepSequence.buildSequence(); // Make sure we rebuild the sequence, otherwise it's still store in code
	
	// force stop the song just in case its playing
	document.getElementById("playButton").setAttribute("src", "assets/images/play.png");
	document.getElementById("playButton").setAttribute("class", "s_stopped");
	document.getElementById("playButton").setAttribute("state", "stopped");
	StepSequence.stop();
}

Mixer.save = function() {
	Interface.showInput("Save Track", "Name this track", "New Track 1", function(results) {
		if(results != null) {
			if(localStorage.getItem("savedTracks") == null) {
				localStorage.setItem("savedTracks", JSON.stringify([]));
			}
			
			var tracks = JSON.parse(localStorage.getItem("savedTracks"));
			tracks.push(results.value+"||[\/@]/@||"+Mixer._collection.id+"||[\/@]/@||"+JSON.stringify(StepSequence._set));
									
			localStorage.setItem("savedTracks", JSON.stringify(tracks));
			
			var options = [];
			options["yes"] = true;
			
			Interface.showMessage("Saved", "Your track has been saved!", null, options);
		}
	 });
}