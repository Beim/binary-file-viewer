import * as assert from 'assert';
import {dataBuffer, convertToHexString, setLastOffset, setLastSize, setLastBitOffset, setLastBitSize, setLittleEndian, read, setOffset, getOffset, getNumberValue, getSignedNumberValue, getBitsValue, getHexValue, getHex0xValue, getDecimalValue, getSignedDecimalValue, getStringValue, setDataBuffer, _getDecimalValue, _getSignedDecimalValue, _getHexValue} from '../src/html/dataread';


/**
 * This tests the functions defined in the webview.
 */

describe('Functions', () => {

	// Called for each test.
	beforeEach(() => {
		setLastOffset(1);
		setLastSize(0);
		setLastBitOffset(0);
		setLastBitSize(0);
		setLittleEndian(true);
	});


	describe('convertToHexString()', () => {
		test('undefined', () => {
			assert.equal(convertToHexString(undefined, 5), '?????');
		});
		test('misc', () => {
			assert.equal(convertToHexString(1, 3), '001');
			assert.equal(convertToHexString(0xFE013A, 6), 'FE013A');
			assert.equal(convertToHexString(0xABCDEFFE013A, 6), 'ABCDEFFE013A');
			assert.equal(convertToHexString(0xF0E0ABCDEFFE013A, 6), 'F0E0ABCDEFFE0000');  // Is inaccurate
		});
		test('unspecified, negative nubmers', () => {
			assert.equal(convertToHexString(-1, 3), '0-1');
		});
	});


	describe('getNumberValue()', () => {

		describe('litte endian', () => {
			test('1 byte', () => {
				setDataBuffer(new Uint8Array([0, 254]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(getNumberValue(), 254);
			});

			test('2 byte', () => {
				setDataBuffer(new Uint8Array([0, 0x05, 0x82]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(getNumberValue(), 0x8205);
			});

			test('4 byte', () => {
				setDataBuffer(new Uint8Array([0, 0x05, 0x82, 0xAB, 0x7F]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(getNumberValue(), 0x7FAB8205);
			});

			test('8 byte', () => {
				setDataBuffer(new Uint8Array([0, 0x04, 0x82, 0xAB, 0x7F, 0x01, 0x02, 0x03, 0x8A]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(getNumberValue(), 9944794607624356000);
			});

			test('8 byte, same value, inaccurate', () => {
				setDataBuffer(new Uint8Array([0, 0x05 /*IS DIFFERENT*/, 0x82, 0xAB, 0x7F, 0x01, 0x02, 0x03, 0x8A]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(getNumberValue(), 9944794607624356000);
			});
		});


		describe('big endian', () => {
			beforeEach(() => {
				setLittleEndian(false);
			});

			test('1 byte', () => {	// NOSONAR
				setDataBuffer(new Uint8Array([0, 254]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(getNumberValue(), 254);
			});

			test('2 byte', () => {
				setDataBuffer(new Uint8Array([0, 0x82, 0x05 ]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(getNumberValue(), 0x8205);
			});

			test('4 byte', () => {
				setDataBuffer(new Uint8Array([0, 0x7F, 0xAB, 0x82, 0x05]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(getNumberValue(), 0x7FAB8205);
			});

			test('8 byte', () => {
				setDataBuffer(new Uint8Array([0, 0x8A, 0x03, 0x02, 0x01, 0x7F, 0xAB, 0x82, 0x04]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(getNumberValue(), 9944794607624356000);
			});

			test('8 byte, same value, inaccurate', () => {
				setDataBuffer(new Uint8Array([0, 0x8A, 0x03, 0x02, 0x01, 0x7F, 0xAB, 0x82, 0x05 /*IS DIFFERENT*/]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(getNumberValue(), 9944794607624356000);
			});
		});

		describe('bits', () => {
			beforeEach(() => {
				// Endianness does not matter.
				setLastBitOffset(1);
				setLastSize(0);
			});

			test('In 1 byte', () => {
				setDataBuffer(new Uint8Array([0, 0b11110110]));
				setLastBitSize(5);
				assert.equal(getNumberValue().toString(2), '11011');
			});

			test('Through 2 bytes', () => {
				setDataBuffer(new Uint8Array([0, 0b11110110, 0b11111111]));
				setLastBitSize(9);
				assert.equal(getNumberValue().toString(2), '111111011');
			});

			test('Through 3 bytes', () => {
				setDataBuffer(new Uint8Array([0, 0b11110110, 0b10010010, 0b11111111]));
				setLastBitSize(18);
				assert.equal(getNumberValue().toString(2), '111100100101111011');
			});
		});
	});


	describe('getSignedNumberValue()', () => {

		describe('little endian', () => {

			test('1 byte', () => {
				setDataBuffer(new Uint8Array([0, 254]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(getSignedNumberValue(), -2);
			});

			test('2 byte', () => {
				setDataBuffer(new Uint8Array([0, 0x05, 0x82]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(getSignedNumberValue(), -32251);
			});

			test('4 byte', () => {
				setDataBuffer(new Uint8Array([0, 0x05, 0x82, 0xAB, 0x7F]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(getSignedNumberValue(), 0x7FAB8205);
			});

			test('8 byte', () => {
				setDataBuffer(new Uint8Array([0, 0x04, 0x82, 0xAB, 0x7F, 0x01, 0x02, 0x03, 0x8A]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(getSignedNumberValue(), -8501949466085195000);
			});

			test('8 byte, same value, inaccurate', () => {
				setDataBuffer(new Uint8Array([0, 0x05 /*IS DIFFERENT*/, 0x82, 0xAB, 0x7F, 0x01, 0x02, 0x03, 0x8A]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(getSignedNumberValue(), -8501949466085195000);
			});
		});


		describe('big endian', () => {
			beforeEach(() => {
				setLittleEndian(false);
			});

			test('1 byte', () => {
				setDataBuffer(new Uint8Array([0, 253]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(getSignedNumberValue(), -3);
			});

			test('2 byte', () => {
				setDataBuffer(new Uint8Array([0, 0x82, 0x05]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(getSignedNumberValue(), -32251);
			});

			test('4 byte', () => {
				setDataBuffer(new Uint8Array([0, 0x7F, 0xAB, 0x82, 0x05]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(getSignedNumberValue(), 0x7FAB8205);
			});

			test('8 byte', () => {
				setDataBuffer(new Uint8Array([0, 0x8A, 0x03, 0x02, 0x01, 0x7F, 0xAB, 0x82, 0x04]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(getSignedNumberValue(), -8501949466085195000);
			});

			test('8 byte, same value, inaccurate', () => {
				setDataBuffer(new Uint8Array([0, 0x8A, 0x03, 0x02, 0x01, 0x7F, 0xAB, 0x82, 0x05 /*IS DIFFERENT*/]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(getSignedNumberValue(), -8501949466085195000);
			});
		});

		describe('bits', () => {
			beforeEach(() => {
				// Endianness does not matter.
				setLastBitOffset(1);
				setLastSize(0);
			});

			test('In 1 byte', () => {
				setLastBitSize(5);

				// negative
				setDataBuffer(new Uint8Array([0, 0b11110110]));
				assert.equal(getSignedNumberValue(), -5);

				// positive
				setDataBuffer(new Uint8Array([0, 0b11010110]));
				assert.equal(getSignedNumberValue(), 11);
			});

			test('Through 2 bytes', () => {
				setLastBitSize(9);

				// negative
				setDataBuffer(new Uint8Array([0, 0b10110110, 0b11111111]));
				assert.equal(getSignedNumberValue(), -37); // 1 11011011

				// positive
				setDataBuffer(new Uint8Array([0, 0b10110110, 0b11111101]));
				assert.equal(getSignedNumberValue(), 219); // 0 11011011
			});

			test('Through 3 bytes', () => {
				setLastBitSize(18);

				// negative
				setDataBuffer(new Uint8Array([0, 0b10110110, 0b10010010, 0b11111110]));
				assert.equal(getSignedNumberValue(), 0b110100100101011011 - 0b1000000000000000000); // 11 01001001 01011011

				// positive
				setDataBuffer(new Uint8Array([0, 0b10110110, 0b10010010, 0b11111010]));
				assert.equal(getSignedNumberValue(), 0b010100100101011011); // 01 01001001 01011011
			});
		});
	});

	describe('getBitsValue()', () => {
		beforeEach(() => {	// NOSONAR
			setLastOffset(1);
			setLastSize(0);
			setLastBitOffset(0);
			setLastBitSize(0);
			setLittleEndian(true);
		});

		test('lastSize = 2', () => {
			setDataBuffer(new Uint8Array([0, 0x0F, 0x12]));
			setLastSize(dataBuffer.length - 1);
			const s: any = getBitsValue();
			assert.equal(s.toString(), '00010010_00001111');
			assert.equal(s.hoverValue, 'Hex: 0x120F');
		});

		test('lastBitSize = 19', () => {
			setDataBuffer(new Uint8Array([0, 0x0F, 0x12, 0xFB]));
			setLastSize(0);
			setLastBitSize(19);
			setLastBitOffset(4);
			const s: any = getBitsValue();
			assert.equal(s.toString(), '111_10110001_00100000');
			assert.equal(s.hoverValue, 'Hex: 0x7B120');
		});
	});

	describe('_getDecimalValue()', () => {
		beforeEach(() => {	// NOSONAR
			setLastOffset(1);
			setLastSize(0);
			setLastBitOffset(0);
			setLastBitSize(0);
			setLittleEndian(true);
		});

		describe('little endian', () => {
			test('1 byte', () => {
				setDataBuffer(new Uint8Array([0, 0x0F]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getDecimalValue(), '15');

				setDataBuffer(new Uint8Array([0, 0x9F]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getDecimalValue(), '159');
			});

			test('3 bytes', () => {
				setDataBuffer(new Uint8Array([0, 0x0F, 0x12, 0x7B]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getDecimalValue(), '8065551');
			});

			test('10 bytes', () => {
				setDataBuffer(new Uint8Array([0, 0x0F, 0x12, 0x7B, 0x40, 0xFE, 0x3A, 0x55, 0x00, 0x6D, 0x7E]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getDecimalValue(), '597028895935846336369167');
			});
		});

		describe('big endian', () => {
			beforeEach(() => {
				setLittleEndian(false);
			});

			test('1 byte', () => {	// NOSONAR
				setDataBuffer(new Uint8Array([0, 0x0F]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getDecimalValue(), '15');

				setDataBuffer(new Uint8Array([0, 0x9F]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getDecimalValue(), '159');
			});

			test('3 bytes', () => {
				setDataBuffer(new Uint8Array([0, 0x7B, 0x12, 0x0F]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getDecimalValue(), '8065551');
			});

			test('10 bytes', () => {
				setDataBuffer(new Uint8Array([0, 0x7E, 0x6D, 0x00, 0x55, 0x3A, 0xFe, 0x40, 0x7B, 0x12, 0x0F]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getDecimalValue(), '597028895935846336369167');
			});
		});

		describe('bits', () => {
			beforeEach(() => {
				// Endianness does not matter.
				setLastBitOffset(2);
				setLastSize(0);
			});

			test('In 1 byte', () => {
				setDataBuffer(new Uint8Array([0, 0b11110110]));
				setLastBitSize(5);
				assert.equal(_getDecimalValue(), '29');	// '11101'
			});

			test('Through 2 bytes', () => {
				setDataBuffer(new Uint8Array([0, 0b11110110, 0b11111110]));
				setLastBitSize(9);
				assert.equal(_getDecimalValue(), '445'); // '110111101'
			});

			test('Through 3 bytes', () => {
				setDataBuffer(new Uint8Array([0, 0b11110110, 0b10010010, 0b11111111]));
				setLastBitSize(18);
				assert.equal(_getDecimalValue(), '255165'); // '11'1110 0100'1011 1101'
			});

			test('8 bit', () => {
				setDataBuffer(new Uint8Array([0, 0b00110110, 0b00]));
				setLastBitSize(8);
				assert.equal(_getDecimalValue(), '13'); // '0000 1101'
			});
		});
	});

	describe('_getSignedDecimalValue()', () => {
		beforeEach(() => {	// NOSONAR
			setLastOffset(1);
			setLastSize(0);
			setLastBitOffset(0);
			setLastBitSize(0);
			setLittleEndian(true);
		});

		describe('little endian', () => {
			test('1 byte', () => {
				setDataBuffer(new Uint8Array([0, 0x0F]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getSignedDecimalValue(), '15');

				setDataBuffer(new Uint8Array([0, 0x9F]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getSignedDecimalValue(), '-97');
			});

			test('3 bytes', () => {
				setDataBuffer(new Uint8Array([0, 0x0F, 0x12, 0x7B]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getSignedDecimalValue(), '8065551');

				setDataBuffer(new Uint8Array([0, 0x0F, 0x12, 0x8B]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getSignedDecimalValue(), '-7663089');
			});

			test('10 bytes', () => {
				setDataBuffer(new Uint8Array([0, 0x0F, 0x12, 0x7B, 0x40, 0xFE, 0x3A, 0x55, 0x00, 0x6D, 0x7E]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getSignedDecimalValue(), '597028895935846336369167');

				setDataBuffer(new Uint8Array([0, 0xFD, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getSignedDecimalValue(), '-3');
			});
		});

		describe('big endian', () => {
			beforeEach(() => {
				setLittleEndian(false);
			});

			test('1 byte', () => {	// NOSONAR
				setDataBuffer(new Uint8Array([0, 0x0F]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getSignedDecimalValue(), '15');

				setDataBuffer(new Uint8Array([0, 0x9F]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getSignedDecimalValue(), '-97');
			});

			test('3 bytes', () => {
				setDataBuffer(new Uint8Array([0, 0x7B, 0x12, 0x0F]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getSignedDecimalValue(), '8065551');

				setDataBuffer(new Uint8Array([0, 0x8B, 0x12, 0x0F]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getSignedDecimalValue(), '-7663089');
			});

			test('10 bytes', () => {
				setDataBuffer(new Uint8Array([0, 0x7E, 0x6D, 0x00, 0x55, 0x3A, 0xFE, 0x40, 0x7B, 0x12, 0x0F]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getSignedDecimalValue(), '597028895935846336369167');

				setDataBuffer(new Uint8Array([0, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFD]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getSignedDecimalValue(), '-3');
			});
		});

		describe('bits', () => {	// NOSONAR
			beforeEach(() => {
				// Endianness does not matter.
				setLastBitOffset(2);
				setLastSize(0);
			});

			test('In 1 byte', () => {	// NOSONAR
				setDataBuffer(new Uint8Array([0, 0b11110110]));
				setLastBitSize(5);
				assert.equal(_getDecimalValue(), '29');	// '11101'
			});

			test('Through 2 bytes', () => {	// NOSONAR
				setDataBuffer(new Uint8Array([0, 0b11110110, 0b11111110]));
				setLastBitSize(9);
				assert.equal(_getDecimalValue(), '445'); // '110111101'
			});

			test('Through 3 bytes', () => {	// NOSONAR
				setDataBuffer(new Uint8Array([0, 0b11110110, 0b10010010, 0b11111111]));
				setLastBitSize(18);
				assert.equal(_getDecimalValue(), '255165'); // '11'1110 0100'1011 1101'
			});

			test('8 bit', () => {	// NOSONAR
				setDataBuffer(new Uint8Array([0, 0b00110110, 0b00]));
				setLastBitSize(8);
				assert.equal(_getDecimalValue(), '13'); // '0000 1101'
			});
		});
	});

	describe('getDecimalValue()', () => {
		test('value + hover', () => {
			setDataBuffer(new Uint8Array([0, 0x0F, 0x12, 0x7B, 0x40, 0xFE, 0x3A, 0x55, 0x00, 0x6D, 0x7E]));
			setLastSize(dataBuffer.length - 1);
			const s: any = getDecimalValue();
			assert.equal(s.toString(), '597028895935846336369167');
			assert.equal(s.hoverValue, 'Hex: 0x7E6D00553AFE407B120F');
		});
	});

	describe('getSignedDecimalValue()', () => {
		test('value + hover', () => {
			setDataBuffer(new Uint8Array([0, 0x0F, 0x12, 0x7B, 0x40, 0xFE, 0x3A, 0x55, 0x00, 0x6D, 0x7E]));
			setLastSize(dataBuffer.length - 1);
			let s: any = getSignedDecimalValue();
			assert.equal(s.toString(), '597028895935846336369167');
			assert.equal(s.hoverValue, 'Hex: 0x7E6D00553AFE407B120F');

			setDataBuffer(new Uint8Array([0, 0xFD, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]));
			setLastSize(dataBuffer.length - 1);
			s = getSignedDecimalValue();
			assert.equal(s.toString(), '-3');
			assert.equal(s.hoverValue, 'Hex: 0xFFFFFFFFFFFFFFFD');
		});
	});

	describe('_getHexValue()', () => {
		beforeEach(() => {	// NOSONAR
			setLastOffset(1);
			setLastSize(0);
			setLastBitOffset(0);
			setLastBitSize(0);
			setLittleEndian(true);
		});

		describe('little endian', () => {
			test('1 byte', () => {
				setDataBuffer(new Uint8Array([0, 0x0F]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getHexValue(), '0F');

				setDataBuffer(new Uint8Array([0, 0x9F]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getHexValue(), '9F');
			});

			test('3 bytes', () => {
				setDataBuffer(new Uint8Array([0, 0x0F, 0x12, 0x7B]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getHexValue(), '7B120F');
			});

			test('10 bytes', () => {
				setDataBuffer(new Uint8Array([0, 0x0F, 0x12, 0x7B, 0x40, 0xFE, 0x3A, 0x55, 0x00, 0x6D, 0x7E]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getHexValue(), '7E6D00553AFE407B120F');
			});
		});

		describe('big endian', () => {
			beforeEach(() => {
				setLittleEndian(false);
			});

			test('1 byte', () => {	// NOSONAR
				setDataBuffer(new Uint8Array([0, 0x0F]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getHexValue(), '0F');

				setDataBuffer(new Uint8Array([0, 0x9F]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getHexValue(), '9F');
			});

			test('3 bytes', () => {
				setDataBuffer(new Uint8Array([0, 0x0F, 0x12, 0x7B]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getHexValue(), '0F127B');
			});

			test('10 bytes', () => {
				setDataBuffer(new Uint8Array([0, 0x0F, 0x12, 0x7B, 0x40, 0xFE, 0x3A, 0x55, 0x00, 0x6D, 0x7E]));
				setLastSize(dataBuffer.length - 1);
				assert.equal(_getHexValue(), '0F127B40FE3A55006D7E');
			});
		});

		describe('bits', () => {
			beforeEach(() => {
				// Endianness does not matter.
				setLastBitOffset(2);
				setLastSize(0);
			});

			test('In 1 byte', () => {
				setDataBuffer(new Uint8Array([0, 0b11110110]));
				setLastBitSize(5);
				assert.equal(_getHexValue(), '1D');	// '11101'
			});

			test('Through 2 bytes', () => {
				setDataBuffer(new Uint8Array([0, 0b11110110, 0b11111110]));
				setLastBitSize(9);
				assert.equal(_getHexValue(), '1BD'); // '110111101'
			});

			test('Through 3 bytes', () => {
				setDataBuffer(new Uint8Array([0, 0b11110110, 0b10010010, 0b11111111]));
				setLastBitSize(18);
				assert.equal(_getHexValue(), '3E4BD'); // '11'1110 0100'1011 1101'
			});

			test('8 bit', () => {
				setDataBuffer(new Uint8Array([0, 0b00110110, 0b00]));
				setLastBitSize(8);
				assert.equal(_getHexValue(), '0D'); // '0000 1101'
			});
		});
	});

	describe('getHexValue()', () => {
		test('value + hover', () => {
			setDataBuffer(new Uint8Array([0, 0x0F, 0x12, 0x7B, 0x40, 0xFE, 0x3A, 0x55, 0x00, 0x6D, 0x7E]));
			setLastSize(dataBuffer.length - 1);
			const s: String = getHexValue();	// NOSONAR
			assert.equal(s.toString(), '7E6D00553AFE407B120F');
			assert.equal((s as any).hoverValue, 'Dec: 597028895935846336369167');
		});
	});

	describe('getHex0xValue()', () => {
		test('value + hover', () => {
			setDataBuffer(new Uint8Array([0, 0x0F, 0x12, 0x7B, 0x40, 0xFE, 0x3A, 0x55, 0x00, 0x6D, 0x7E]));
			setLastSize(dataBuffer.length - 1);
			const s: String = getHex0xValue();	// NOSONAR
			assert.equal(s.toString(), '0x7E6D00553AFE407B120F');
			assert.equal((s as any).hoverValue, 'Dec: 597028895935846336369167');
		});
	});

	describe('getStringValue()', () => {
		beforeEach(() => {
			setLastOffset(1);
		});

		test('1 char', () => {
			setDataBuffer(new TextEncoder().encode("_A"));
			setLastSize(dataBuffer.length - 1);
			assert.equal(getStringValue(), 'A');
		});

		test('3 chars', () => {
			setDataBuffer(new TextEncoder().encode("_ABC"));
			setLastSize(dataBuffer.length - 1);
			assert.equal(getStringValue(), 'ABC');
		});
	});


	describe('offset', () => {

		describe('absolute offset', () => {
			test('setOffset', () => {
				setDataBuffer(new Uint8Array([0, 1, 2, 3, 254]));
				setLastSize(1);
				setOffset(4);	// at 254
				read(1);
				assert.equal(getNumberValue(), 254);
				setOffset(1);
				read(1);
				assert.equal(getNumberValue(), 1);
			});

			test('getOffset', () => {
				setDataBuffer(new Uint8Array([0, 1, 2, 3, 254]));
				setLastOffset(2);
				setLastSize(1);
				assert.equal(getNumberValue(), 2);

				const prevValue = getOffset();

				setOffset(4);	// at 254
				read(1);
				assert.equal(getNumberValue(), 254);

				// Restore
				setOffset(prevValue);
				read(1);
				assert.equal(getNumberValue(), 2);
			});

			test('exceptions', () => {
				setDataBuffer(new Uint8Array([0, 1, 2, 3, 254]));
				setLastOffset(1);
				setLastSize(0);

				// No offset
				assert.throws(() => {
					setOffset(undefined);
				});

				// Not a number
				assert.throws(() => {
					setOffset("abc" as any as number);
				});

				// Bigger than file
				assert.throws(() => {
					setOffset(6);	// Note: directly after the last position is still allowed.
				});

				// Before file start
				assert.throws(() => {
					setOffset(-1);
				});
			});
		});

		describe('relative offset', () => {
			test('forward', () => {
				setDataBuffer(new Uint8Array([0, 1, 2, 3, 254]));
				setLastOffset(1);
				setLastSize(0);
				read(2);
				read(1);
				assert.equal(getNumberValue(), 3);
			});

			test('get/restore offset', () => {
				setDataBuffer(new Uint8Array([0, 1, 2, 3, 254]));
				setLastOffset(1);
				setLastSize(0);
				read(3);
				read(1);
				assert.equal(getNumberValue(), 254);
				read(-2);
				assert.equal(getNumberValue(), 256 * 254 + 3);
			});

			test('exceptions', () => {
				setDataBuffer(new Uint8Array([0, 1, 2, 3, 254]));
				setLastOffset(1);
				setLastSize(0);

				// Not a number
				assert.throws(() => {
					read("abc" as any as number);
				});

				// Bigger than file
				assert.throws(() => {
					read(5);
				});

				// Before file start
				assert.throws(() => {
					read(-2);
				});
			});
		});

	});
});



//const BigInt256 = BigInt(256);
