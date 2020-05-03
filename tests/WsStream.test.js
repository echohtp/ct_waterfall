import React from 'react';
import renderer from 'react-test-renderer';

import WsStream from '../src/component/WsStream.js';

describe('<WsStream />', () => {
    it('should match the snapshot', () => {
      const component = renderer.create(<WsStream />).toJSON();
      expect(component).toMatchSnapshot();
    });
  });