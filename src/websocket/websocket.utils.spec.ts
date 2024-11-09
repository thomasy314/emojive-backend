import { subProtocolsToObject } from './websocket.utils';

describe('subProtocolsToObject', () => {
  test('GIVEN an array of sub-protocols THEN convert it to an object', () => {
    // Setup
    const subProtocols = ['protocol1', 'value1', 'protocol2', 'value2'];
    const expected = {
      protocol1: 'value1',
      protocol2: 'value2',
    };

    // Execute
    const result = subProtocolsToObject(subProtocols);

    // Validate
    expect(result).toEqual(expected);
  });

  test('GIVEN an empty array THEN return an empty object', () => {
    // Setup
    const subProtocols: string[] = [];
    const expected = {};

    // Execute
    const result = subProtocolsToObject(subProtocols);

    // Validate
    expect(result).toEqual(expected);
  });

  test('GIVEN an array with one protocol without a value THEN return an object with the protocol and undefined value', () => {
    // Setup
    const subProtocols = ['protocol1'];
    const expected = {
      protocol1: undefined,
    };

    // Execute
    const result = subProtocolsToObject(subProtocols);

    // Validate
    expect(result).toEqual(expected);
  });

  test('GIVEN an array with an odd number of elements THEN return an object with the last protocol having undefined value', () => {
    // Setup
    const subProtocols = ['protocol1', 'value1', 'protocol2'];
    const expected = {
      protocol1: 'value1',
      protocol2: undefined,
    };

    // Execute
    const result = subProtocolsToObject(subProtocols);

    // Validate
    expect(result).toEqual(expected);
  });

  test('GIVEN an array with duplicate protocols THEN return an object with the last value for the duplicate protocol', () => {
    // Setup
    const subProtocols = ['protocol1', 'value1', 'protocol1', 'value2'];
    const expected = {
      protocol1: 'value2',
    };

    // Execute
    const result = subProtocolsToObject(subProtocols);

    // Validate
    expect(result).toEqual(expected);
  });
});
