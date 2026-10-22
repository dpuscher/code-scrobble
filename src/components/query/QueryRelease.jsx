import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import Link from 'next/link';
import { IoIosSearch } from 'react-icons/io';
import { MdClose } from 'react-icons/md';
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
            <Result key={id} as={Link} href={`/detected/id:${id}`}>
              <ThumbnailWrapper>
                {thumb && <Thumbnail src={thumb} alt="" width={60} height={60} loading="lazy" />}
              </ThumbnailWrapper>
              <ResultInfo>
                <Title>
                  {title}
                  {year && ` (${year})`}
                </Title>
                <Meta>
                  {[country, (format || []).join(', ')].filter(Boolean).join(' · ')}
                </Meta>
              </ResultInfo>
            </Result>
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
        <Button onClick={this.open} aria-label="Search release">
          <Icon />
        </Button>
        {open && (
          <Overlay>
            <Content>
              <CloseButton onClick={this.close} aria-label="Close">
                <MdClose size="30" color={silver} />
              </CloseButton>
              <HeadWrapper onSubmit={this.onSubmit}>
                <Input value={query} onChange={this.onInput} placeholder="Search release..." aria-label="Search release" type="search" autoFocus ref={this.inputRef} />
                <Submit type="submit" aria-label="Search">
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
