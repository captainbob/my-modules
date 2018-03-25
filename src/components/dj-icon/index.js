import React, {PureComponent, Component} from 'react';
import propTypes from "prop-types";

class Icon extends (PureComponent || Component) {
    constructor(props) {
        super(props);
    }

    render() {
        const {type, ...props} = this.props;
        return <i {...props} className={`djicon dj-${type}`}/>;
    }
}

Icon.propTypes = {
    type: propTypes.string
}
export default Icon;