import React, { Component } from 'react';
import { HttpUtil } from 'djmodules-utils'

const Remote = {
    getList: function (data) {
        let _this = this;
        return new Promise(function (resolve, reject) {
            HttpUtil.promiseGet("/rs/excel/job/get_list.do", {
                bizType: data.bizType,
                _options: {
                    deconstructResultObject: false
                }
            }).then((resp) => {
                if (_this.isComplete(resp.resultObject)) {
                    resp.complete = true;
                } else {
                    resp.complete = false;
                }
                resolve(resp)
            }).catch(e => {
                reject(e)
            });
        })
    },
    getDetail: function (data) {
        let _this = this;
        return new Promise(function (resolve, reject) {
            HttpUtil.promiseGet("/rs/excel/job/get_detail.do", {
                bizType: data.bizType, jobId: data.jobId,
            }).then((json) => {
                if (json) {
                    if (_this.isComplete([json])) {
                        json.complete = true;
                    } else {
                        json.complete = false;
                    }
                }
                resolve(json)
            }).catch(e => {
                reject(e)
            });
        })
    },
    getReport: function (jobId) {
        let _this = this;
        return new Promise(function (resolve, reject) {
            HttpUtil.promiseGet("/rs/excel/job/get_report.do", {
                jobId: jobId,
                logLevel: "ERROR,DATA",
                resultCode: "failure",
                _options: {
                    deconstructResultObject: false
                }
            }).then((resp) => {
                resolve(resp)
            }).catch(e => {
                reject(e)
            });
        })
    },

    addExportJob: function (data) {
        data._options = {
            deconstructResultObject: false
        }
        return new Promise(function (resolve, reject) {
            HttpUtil.promisePost("/rs/excel/job/add_export.do", data, {}).then((resp) => {
                resolve(resp)
            });
        });
    },

    addImportJob: function (data, scene) {
        let cdata = Object.assign({ scene: scene }, data)
        cdata._options = {
            deconstructResultObject: false
        }
        return new Promise(function (resolve, reject) {
            HttpUtil.promisePost("/rs/excel/job/add_import.do", cdata, {}).then((resp) => {
                resolve(resp)
            });
        });
    },

    runImportJob: function (data, scene) {
        let cdata = Object.assign({ scene: scene }, data)
        cdata._options = {
            deconstructResultObject: false
        }
        return new Promise(function (resolve, reject) {
            HttpUtil.promisePost("/rs/excel/job/run_import.do", cdata, {}).then((resp) => {
                resolve(resp)
            });
        });
    },

    delJob: function (data) {
        data = { jobId: data.jobId }
        data._options = {
            deconstructResultObject: false
        }
        return new Promise(function (resolve, reject) {
            HttpUtil.promisePost("/rs/excel/job/del.do", data, {}).then((resp) => {
                resolve(resp)
            });
        });
    },
    signature: function () {
        let data = {};
        data._options = {
            deconstructResultObject: false
        }
        return new Promise(function (resolve, reject) {
            HttpUtil.promisePost("/rs/excel/job/signature.do", data).then((resp) => {
                resolve(resp)
            });
        });
    },
    //是否完成
    isComplete: function (resultObject) {
        var complete = true;
        if (resultObject) {
            for (var i = 0; i < resultObject.length; i++) {
                var jobAtom = resultObject[i];
                jobAtom.key = i;
                //初始化或进行中的任务 0初始化 1 进行中
                if (jobAtom.jobStatus == 0 || jobAtom.jobStatus == 1) {
                    complete = false;
                }

                var precent = 0;

                if (jobAtom.totalCount == null) {
                    jobAtom.totalCount = 0;
                }

                jobAtom.status = "active";

                if (jobAtom.totalCount != 0) {
                    if (jobAtom.outCount > jobAtom.totalCount) {
                        jobAtom.percent = 100
                        console.warn("总记录数" + jobAtom.totalCount + "条，但是导出数却有" + jobAtom.outCount)
                    } else {
                        jobAtom.percent = parseInt((jobAtom.outCount / jobAtom.totalCount) * 100)
                    }
                }

                //完成
                if (jobAtom.excelStatus == 9) {
                    if (jobAtom.precent == 100) {
                        jobAtom.status = "success";
                    }
                    if (jobAtom.outCount == 0 && jobAtom.totalCount == 0) {
                        jobAtom.errorInfo = "Excel中未发现数据";
                    }
                } else if (jobAtom.excelStatus == 2) {//异常
                    jobAtom.status = "exception";
                }


            }
        }
        return complete;
    }

}
export default Remote;
