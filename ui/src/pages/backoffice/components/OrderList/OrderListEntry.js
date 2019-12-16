import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Grid, Header, Item, List, Icon } from 'semantic-ui-react';
import { AcquisitionRoutes, BackOfficeRoutes } from '@routes/urls';
import { toShortDateTime } from '@api/date';
import { formatPrice } from '@api/utils';
import { invenioConfig } from '@config';
import { getDisplayVal } from '@config/invenioConfig';

export default class OrderListEntry extends Component {
  renderLeftColumn = order => {
    return (
      <>
        <Item.Description>
          <Item.Meta>
            Ordered: {toShortDateTime(order.metadata.order_date)}
          </Item.Meta>
        </Item.Description>
        <Item.Description>
          <label>status </label>
          {getDisplayVal('orders.statuses', order.metadata.status).text}
        </Item.Description>
        <Item.Description>
          <label>vendor </label>
          <Link
            to={AcquisitionRoutes.vendorDetailsFor(order.metadata.vendor_pid)}
          >
            {order.metadata.vendor.name}
          </Link>
        </Item.Description>
        <Item.Description>
          <label>total</label> {formatPrice(order.metadata.grand_total)}
        </Item.Description>
      </>
    );
  };

  renderOrderLine = (orderLine, index) => {
    const documentPid = orderLine.document_pid;
    const patronPid = orderLine.patron_pid;
    const medium = getDisplayVal('items.mediums', orderLine.medium).text;
    const documentLink = (
      <Link to={BackOfficeRoutes.documentDetailsFor(documentPid)}>
        <code>{documentPid}</code>
      </Link>
    );
    const totalPrice = formatPrice(orderLine.total_price);
    return (
      <List.Item
        as="li"
        key={documentPid}
        value={`${orderLine.copies_ordered}x`}
      >
        Document {documentLink} - {medium}
        {patronPid && (
          <>
            {' '} - Patron{' '}
            <Link to={BackOfficeRoutes.patronDetailsFor(patronPid)}>
              <code>{patronPid}</code>
            </Link>
          </>
        )}{' '}
        - <em>{totalPrice}</em>
      </List.Item>
    );
  };

  renderMiddleColumn = order => {
    if (this.props.renderMiddleColumn) {
      return this.props.renderMiddleColumn(order);
    }
    const showMax = invenioConfig.orders.maxShowOrderLines;
    const orderLines = order.metadata.order_lines;
    return (
      <List as="ol">
        {orderLines
          .slice(0, showMax)
          .map((ol, index) => this.renderOrderLine(ol, index))}
        {orderLines.length > showMax && (
          <List.Item as="li" value="...">
            of {orderLines.length} order lines
          </List.Item>
        )}
      </List>
    );
  };

  renderRightColumn = order => {
    if (this.props.renderRightColumn) {
      return this.props.renderRightColumn(order);
    }
    const { received_date, expected_delivery_date, payment } = order.metadata;
    return (
      <List verticalAlign="middle" className={'document-circulation'}>
        <List.Item>
          <List.Content floated="right">
            <strong>{payment.mode}</strong>
          </List.Content>
          <List.Content>payment mode</List.Content>
        </List.Item>
        {received_date && (
          <List.Item>
            <List.Content floated="right">
              <strong>{toShortDateTime(received_date)}</strong>
            </List.Content>
            <List.Content>delivered</List.Content>
          </List.Item>
        )}
        {expected_delivery_date && (
          <List.Item>
            <List.Content floated="right">
              <strong>{toShortDateTime(expected_delivery_date)}</strong>
            </List.Content>
            <List.Content>expected delivery date</List.Content>
          </List.Item>
        )}
      </List>
    );
  };

  render() {
    const { order } = this.props;
    return (
      <Item>
        <Item.Content>
          <Item.Header
            as={Link}
            to={AcquisitionRoutes.orderDetailsFor(order.metadata.pid)}
            data-test={`navigate-${order.metadata.pid}`}
          >
            <Icon name="shopping cart" />
            Order: {order.metadata.pid}
          </Item.Header>
          <Grid highlight={3}>
            <Grid.Column computer={5} largeScreen={5}>
              {this.renderLeftColumn(order)}
            </Grid.Column>
            <Grid.Column computer={6} largeScreen={6}>
              {this.renderMiddleColumn(order)}
            </Grid.Column>
            <Grid.Column width={1} />
            <Grid.Column computer={3} largeScreen={3}>
              {this.renderRightColumn(order)}
            </Grid.Column>
          </Grid>
        </Item.Content>
        <Item.Meta className={'pid-field'}>
          <Header disabled as="h5" className={'pid-field'}>
            #{order.metadata.pid}
          </Header>
        </Item.Meta>
      </Item>
    );
  }
}

OrderListEntry.propTypes = {
  order: PropTypes.object.isRequired,
  renderMiddleColumn: PropTypes.func,
  renderRightColumn: PropTypes.func,
};