


/**
 * Selects the 'obj' extension.
 */
registerFileType((fileExt, filePath, data) => {
	// Check for obj
	if (fileExt == 'obj')
		return true;
	return false;
});



/**
 * Parser for obj files.
 * This parser just demonstrates the very basics of the parsing commands.
 */
registerParser(() => {

	addStandardHeader();

	read(2);
	addRow('WORD 1', getHexValue());

	read(2);
	addRow('WORD 2', getHexValue());

	read(1);
	addRow('BYTE 1', getHexValue());


});


