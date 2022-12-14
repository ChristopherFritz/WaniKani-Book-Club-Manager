function setErrorMessage(message) {

	if ('' != message) {
		message = 'Error: ' + message;
	}

	document.getElementById('errors').innerText = message;

}

function clearErrorMessage() {

	document.getElementById('errors').innerText = '';

}

function showBookList() {

	// TODO: Have a "new series" button that clears out current fields.  Need to request series name which cannot(?) be changed after.  Or allow name change, but then the key changes, so when saving the old entry needs to be removed at the time of saving.
	const keys = Object.keys(localStorage)
	const bookList = document.getElementById('bookList');

	for (let key of keys) {
		if (!key.startsWith(storagePrefix)) {
			continue;
		}
		if (null == localStorage.getItem(key)) {
			continue;
		}
		const value = JSON.parse(localStorage.getItem(key));

		const bookEntry = document.createElement('option');
		bookEntry.innerText = value.bookTitle;
		bookList.appendChild(bookEntry);
	}
}

function refreshButtons() {

	document.getElementById('deleteStorage').disabled = 0 == document.getElementById('bookList').selectedIndex;

}

/* Series buttons */

function showSeries() {

	showSeriesSection('series');

}

function showVolumes() {

	showSeriesSection('volumes');

}

function showTemplates() {

	showSeriesSection('templates');

}

function showVocabulary() {

	showSeriesSection('vocabulary');

}

function showSeriesSection(sectionToShow) {

	const volumes = document.getElementById('content');
	volumes.querySelector('div[id="series"]').style.display = 'none';
	volumes.querySelector('div[id="volumes"]').style.display = 'none';
	volumes.querySelector('div[id="templates"]').style.display = 'none';
	volumes.querySelector('div[id="vocabulary"]').style.display = 'none';

	volumes.querySelector('button[id="showSeries"]').style.removeProperty("color");
	volumes.querySelector('button[id="showVolumes"]').style.removeProperty("color");
	volumes.querySelector('button[id="showTemplates"]').style.removeProperty("color");
	volumes.querySelector('button[id="showVocabulary"]').style.removeProperty("color");

	volumes.querySelector('div[id="' + sectionToShow + '"]').style.display = 'grid';

	const clickedButtonId = 'show' + sectionToShow.charAt(0).toUpperCase() + sectionToShow.slice(1)
	volumes.querySelector('button[id="' + clickedButtonId + '"]').style.color = 'blue';

}

/* Volume buttons */

function showVolume() {

	showVolumeSection('volume');

}

function showChapters() {

	showVolumeSection('chapters');

}

function showWeeks() {

	showVolumeSection('weeks');

}

function showVolumeSection(sectionToShow) {

	const volume = currentVolume();

	Array.from(['volume', 'chapters', 'weeks']).forEach(function(name) {
		const elementByName = volume.querySelector('div[name="' + name + '"]');
		if (null == elementByName) {
			return;
		}
		elementByName.style.display = 'none';
	});

	// Hide add buttons except for what's for the current section.
	document.getElementById('addNewChapter').style.display = 'none';
	document.getElementById('addNewWeek').style.display = 'none';

	let sectionButtonName = null;
	switch(sectionToShow) {
		case 'chapters': sectionButtonName = 'addNewChapter'; break;
		case 'weeks':    sectionButtonName = 'addNewWeek';    break;
	}
	if (null != sectionButtonName) {
		document.getElementById(sectionButtonName).style.removeProperty('display');
	}

	volume.querySelector('div[name="' + sectionToShow + '"]').style.display = 'grid';

}

function allVolumes() {

	return document.getElementsByClassName('volumeContainer');

}

// Returns the current volume's container element.
function currentVolume() {

	const volumeElements = allVolumes();
	let currentElement = null;

	Array.from(volumeElements).forEach(function(element) {
		if ('none' == element.style.display) {
			return;
		}
		currentElement = element;
	});

	return currentElement;
}

function addNewVolume() {

	// Add a new volume to the volumes list.
	const volumesList = document.getElementById('volumesList');
	const volumesListItems = volumesList.getElementsByTagName('option');
	let lastVolumeNumber = 0
	if (0 < volumesListItems.length) {
		lastVolumeNumber = volumesListItems[volumesListItems.length - 1].value.replace('volume', '');
	}
	const newVolumeNumber = Number(lastVolumeNumber) + 1

	const volumesElement = document.getElementById('volumesContainer');

	const volumeContainer = addVolumeFields(volumesElement, newVolumeNumber);
	addChaptersTable(volumeContainer);
	addWeeksTable(volumeContainer);

	addVolumeToList(volumesList, newVolumeNumber, true);
	displayVolume(volumesList);

}

function createEmptyChapter() {

	const emptyRow =
		'<tr>\n' +
		'<td><input name="number"></td>\n' +
		'<td><input name="title"></td>\n' +
		'<td class="clickable" onclick="removeChapter(this)">???</td>\n' +
		'</tr>'
	return htmlToElement(emptyRow);

}

function addNewChapter() {

	const volumeContainer = currentVolume();
	const chaptersContainer = volumeContainer.querySelector('table[name="chapters"]');
	const tableBody = chaptersContainer.getElementsByTagName("tbody")[0];
	const chapterRowElement = createEmptyChapter();
	tableBody.appendChild(chapterRowElement);

}

function removeChapter(element) {

	element.parentNode.remove();

}

function createEmptyWeek() {

	const emptyRow =
		'<tr>\n' +
		'<td><input name="number"></td>\n' +
		'<td><input name="weekThread"></td>\n' +
		'<td><input name="startDate"></td>\n' +
		'<td><input name="chapters"></td>\n' +
		'<td><input name="startPage"></td>\n' +
		'<td><input name="endPage"></td>\n' +
		'<td class="clickable" onclick="removeWeek(this)">???</td>\n' +
		'</tr>'
	return htmlToElement(emptyRow);

}

function addNewWeek() {

	const volumeContainer = currentVolume();
	const weeksContainer = volumeContainer.querySelector('table[name="weeks"]');
	const tableBody = weeksContainer.getElementsByTagName("tbody")[0];
	const weekRowElement = createEmptyWeek();
	tableBody.appendChild(weekRowElement);

}

function removeWeek(element) {

	element.parentNode.remove();

}

function addNewTemplate() {

	// Add a new template to the templates list.  Ask for template name.

	// Ask for the name of the template.
	// TODO: Disallow any characters that will cause an issue for templates.  Maybe allow only alphanumeric characters?
	let newTemplateName = prompt("Name of new template:");
	if (null == newTemplateName || '' == newTemplateName.trim()) {
		return;
	}

	// Remove leading and trailing whitespace to ensure it doesn't cause any issues.
	newTemplateName = newTemplateName.trim();

	addTemplateTable(newTemplateName, '', true);
	addTemplateListItem(newTemplateName, true);
	displayTemplate(templatesList);

	// TODO: Add a template to all selects with the name "volumeTemplate".

}

function removeSelectedTemplate() {

	// TODO: Remove selected template.
	// TODO: Disable remove button.
	// TODO: Enable remove button when a template has been selected.

	const templatesList = document.getElementById('templatesList');

	// Remove the template table.
	const templateTableId = "template" + templatesList.value;
	const table = document.getElementById(templateTableId);
	if (null != table) {
		table.remove();
	}

	// Remove from the template list.
	for (var i=0; i<templatesList.length; i++) {
		if (templatesList.options[i].selected) {
			templatesList.remove(i);
			break;
		}
	}

	// Select the first template from the list.
	if (0 < templatesList.childElementCount) {
		templatesList.firstChild.selected = true;
		displayTemplate(templatesList);
	}


	// TODO: Remove the template from all selects with the name "volumeTemplate".

}
