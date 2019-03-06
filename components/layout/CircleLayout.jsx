import PropTypes from 'prop-types';
import {
  Center, Content, Footer, Header, HeightWrapper, Wrapper,
} from '../../styles/layout.styles';
import LegalLinks from '../LegalLinks';

const CircleLayout = ({ children, header, footer }) => (
  <Center>
    <Wrapper>
      <Header>
        {header}
      </Header>
      <Content>
        <HeightWrapper>
          {children}
        </HeightWrapper>
      </Content>
      <Footer>
        <LegalLinks />
        {footer}
      </Footer>
    </Wrapper>
  </Center>
);

CircleLayout.propTypes = {
  children: PropTypes.any,
  header: PropTypes.any,
  footer: PropTypes.any,
};

CircleLayout.defaultProps = {
  children: null,
  header: null,
  footer: null,
};

export default CircleLayout;
