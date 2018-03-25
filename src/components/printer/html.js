import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'antd';
import getLodop from './lodop';

const htmlTemplate = (head, body) => {
    return `<html>
        <head>
            <style>
                body, html {
                    width:100%;
                }

                .ptable{
                    border-collapse: collapse;
                    width: 100%; 
                }

                .ptable tr th, .ptable tr td, .ptable table tr td, .ptable table tr {
                    padding: 0px;
                    margin: 0px;
                    position: relative;
                }

                .ptable table {
                    border-collapse: collapse; 
                    width: 100%;
                    height: 100%;
                }

                .ptable table tr td,.ptable > tbody tr td,.ptable > thead>tr:last-child> th {
                    border-bottom: 1px solid black;
                    border-right: 1px solid black;
                    position: relative;
                }

                .ptable > tbody>tr>td:first-child{
                    border-left:1px solid black;
                }

                .ptable > thead>tr:last-child> th {
                    border-top:1px solid black;
                }
                
                .ptable > thead>tr:last-child> th:first-child {
                    border-left:1px solid black;
                }

                .ptable table tr th {
                    border-bottom: 1px solid black;
                    border-right: 1px solid black;
                }

                .ptable table tr td:last-child, .ptable table tr th:last-child {
                    border-right: 0px solid black;
                }

                .ptable table tr:last-child > th, .ptable table tr:last-child > td  {
                    border-bottom: 0px solid black;
                }

                .ptable table tr:only-child > th, .ptable table tr:only-child > td  {
                    border-bottom: 0px solid black;
                }
            </style>
            ${head}
        </head>
        <body>
            ${body}
        </body>
    </html>`
}

class HTML extends Component {
    static defaultProps = {
        buttonOptions: {},
        isTable: false,
        auto: true
    }

    render() {
        React.Children.only(this.props.children);

        if (!this.node) {
            this.node = document.createElement('div');
            this.node.style.width = '0px';
            this.node.style.height = '0px';
            this.node.style.overflow = 'hidden';
            document.body.appendChild(this.node);
        }

        ReactDOM.unstable_renderSubtreeIntoContainer(this, this.props.children, this.node);

        return <Button {...this.props.buttonOptions} onClick={this.onClick}></Button>;
    }

    componentWillUnmount() {
        if (this.node) {
            document.body.removeChild(this.node);
        }
    }

    onClick = (event) => {
        if (this.props.auto) {
            this.print().then((html) => {
                if (this.props.buttonOptions.onClick) {
                    this.props.buttonOptions.onClick(event, html);
                }
            }).catch(err => {
                if (this.props.buttonOptions.onClick) {
                    this.props.buttonOptions.onClick(event, err);
                }
            });
        } else {
            if (this.props.buttonOptions.onClick) {
                this.props.buttonOptions.onClick(event, {
                    promise: () => { return this.print(); }
                });
            }
        }
    }

    print = () => {
        return new Promise((resolve, reject) => {
            if (!window.LODOP) {
                window.LODOP = getLodop();
            }

            let html = htmlTemplate(document.getElementsByTagName('head')[0].innerHTML, this.node.innerHTML);

            html = html.replace(/data-ptable-/g, '');

            try {
                window.LODOP.PRINT_INIT("打印任务名");
                if (!this.props.isTable) {
                    window.LODOP.ADD_PRINT_HTM('2%', '2%', '96%', '96%', html);
                } else {
                    window.LODOP.ADD_PRINT_TABLE('2%', '2%', '96%', '96%', html);
                }
                window.LODOP.PREVIEW();
                resolve(html);
            } catch (err) {
                console.error(err.message);
                reject(html);
            }
        });
    }
}

module.exports = HTML;