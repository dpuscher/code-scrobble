import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { IoIosSearch } from 'react-icons/io';
import { MdClose } from 'react-icons/md';
import compact from 'lodash/compact';
import { trackEvent } from '../../lib/analytics';
import { silver } from '../../lib/colors';
import NoResultsIcon from '../icons/NoResultsIcon';
import Loading from '../layout/Loading';
import { queryRelease, resetResults, setQuery } from './actions/queryActions';
import {
  Button, CloseButton, Content, FallbackIcon, FallbackWrapper, HeadWrapper, Icon, Input,
  LoadingWrapper, Meta, Overlay, Result, ResultInfo, ResultWrapper, Submit, Thumbnail,
  ThumbnailWrapper, Title, Wrapper,
} from './styles/QueryRelease.styles';

class QueryRelease extends React.Component {
  inputRef = React.createRef();

  state = {
    open: false,
    searched: false,
  }

  reset = () => {
    this.props.resetResults();
    this.props.setQuery();
    this.setState({ searched: false });
  }

  open = () => {
    this.reset();
    trackEvent('Detect', 'Query Release');
    this.setState({ open: true });
  }

  close = () => {
    this.setState({ open: false, searched: false });
  }

  onInput = (e) => {
    this.props.setQuery(e.target.value);
  }

  onSubmit = (e) => {
    e.preventDefault();
    this.inputRef.current.blur();
    this.props.queryRelease();
    this.setState({ searched: true });
  }

  render() {
    const { open, searched } = this.state;
    const { loading, results, query } = this.props;

    let content = <FallbackWrapper><FallbackIcon color="#F4F4F4" /></FallbackWrapper>;
    if (loading) {
      content = <FallbackWrapper><LoadingWrapper><Loading /></LoadingWrapper></FallbackWrapper>;
    } else if (results.length) {
      content = (
        <ResultWrapper>
          {results.map(({
            id, title, thumb, country, year, format = [],
          }) => (
            <Link key={id} href={`/detected?barcode=id:${id}`} as={`/detected/id:${id}`} passHref>
              <Result>
                <ThumbnailWrapper clientOnly>
                  <Thumbnail src={thumb} alt={title} width={60} height={60} effect="opacity" />
                </ThumbnailWrapper>
                <ResultInfo>
                  <Title>
                    {title}
                    {year && ` (${year})`}
                  </Title>
                  <Meta>
                    {compact([country, (format || []).join(', ')]).join(' · ')}
                  </Meta>
                </ResultInfo>
              </Result>
            </Link>
          ))}
        </ResultWrapper>
      );
    } else if (searched) {
      content = (
        <FallbackWrapper css="text-align:center">
          <NoResultsIcon css="margin-bottom:20px" />
          No results were found
          <br />
          for your query
        </FallbackWrapper>
      );
    }

    return (
      <Wrapper>
        <Button onClick={this.open}>
          <Icon />
        </Button>
        {open && (
          <Overlay>
            <Head>
              <link rel="preconnect" href="https://img.discogs.com" />
            </Head>
            <Content>
              <CloseButton onClick={this.close}>
                <MdClose size="30" color={silver} />
              </CloseButton>
              <HeadWrapper onSubmit={this.onSubmit}>
                <Input value={query} onChange={this.onInput} placeholder="Search release..." autoFocus ref={this.inputRef} />
                <Submit type="submit">
                  <IoIosSearch size={30} />
                </Submit>
              </HeadWrapper>
              {content}
            </Content>
          </Overlay>
        )}
      </Wrapper>
    );
  }
}

QueryRelease.propTypes = {
  results: PropTypes.array,
  query: PropTypes.string,
  loading: PropTypes.bool,
  queryRelease: PropTypes.func.isRequired,
  resetResults: PropTypes.func.isRequired,
  setQuery: PropTypes.func.isRequired,
};

QueryRelease.defaultProps = {
  results: [],
  loading: false,
  query: '',
};

const mapStateToProps = state => ({
  ...state.query,
});

const mapDispatchToProps = dispatch => (
  bindActionCreators({ queryRelease, resetResults, setQuery }, dispatch)
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(QueryRelease);
