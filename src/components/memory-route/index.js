
import { HashRouter, Route } from 'react-router-dom';

import React, { Component } from 'react';

class ComponentWrapper extends Component {
    render() {
        return <div style={{ display: !this.props.match ? 'none' : 'block' }}>
            {
                React.createElement(this.props.component, this.props.renderProps)
            }
        </div>
    }
}

class MemoryRoute extends Route {

    preMatch = -1;

    listeners = new Set();

    addRefreshListener = (callback) => {
        this.listeners.add(callback);
    }

    render() {
        const { match } = this.state
        const { children, component, render } = this.props
        const { history, route, staticContext } = this.context.router
        const location = this.props.location || route.location
        const props = { match, location, history, staticContext }

        if (this.preMatch !== -1 && this.preMatch != !!match) {
            var timer = setTimeout(() => {
                clearTimeout(timer);
                [...this.listeners].forEach(callback => {
                    callback(!!match);
                });
            }, 0);
        }

        this.preMatch = !!match;

        if (component) {
            return React.createElement(ComponentWrapper, {
                renderProps: Object.assign({}, props, { addRefreshListener: this.addRefreshListener }),
                match: match,
                component: component
            });
        }

        if (render)
            return match ? render(props) : null

        if (typeof children === 'function')
            return children(props)

        if (children && !isEmptyChildren(children))
            return React.Children.only(children)

        return null
    }
}

module.exports = MemoryRoute;