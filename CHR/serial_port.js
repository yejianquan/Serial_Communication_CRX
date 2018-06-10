/**
* @author Wead.Ye&Tina.Hu
* @version 1.0.0
*/

var extensionId = "abpijicmjladnfpdcppadampmkbajadl";

function SerialPort() {

    var portGUID;

    var port = chrome.runtime.connect(extensionId);

    var serialConnectionId;

    var isSerialPortOpen = false;

    var onDataReceivedCallback = function(data) {
        var str = "";
        var dv = new DataView(data);
        for (var i = 0; i < dv.byteLength; i++) {
            str = str.concat(String.fromCharCode(dv.getUint8(i, true)));
        }
        if (sValue === null) {
            sValue = "";
        }
        sValue += str;
    };

    var onErrorReceivedCallback = undefined;

    var baudRate;

    var BAUDRATECONST = 2400;

    var portNameInfo = "";

    var sValue = null;

    port.onMessage.addListener(function(msg) {
        console.log(msg);
        if (msg.header === "guid") {
            portGUID = msg.guid;
        } else if (msg.header === "serialdata") {
            if (onDataReceivedCallback !== undefined) {
                onDataReceivedCallback(new Uint8Array(msg.data).buffer);
            }
        } else if (msg.header === "serialerror") {
            onErrorReceivedCallback(msg.error);
        }
    });

    this.isOpen = function() {
        return isSerialPortOpen;
    }

    this.setOnErrorReceivedCallback = function(callBack) {
        onErrorReceivedCallback = callBack;
    }

    this.setPortName = function(pname, callBack) {
        if (isSerialPortOpen === true) {
            callBack("端口已经打开，不能设置端口名，请先关闭端口！");
        } else {
            portNameInfo = pname;
            callBack("端口名设置成功！");
        }
    }

    this.setBaudRate = function(brate, callBack) {
        if (isSerialPortOpen === true) {
            callBack({
                result: "error",
                error: "端口已经打开，不能设置波特率，请先关闭端口！"
            });
        } else {
            if (isNaN(brate) || brate === null) {
                baudRate = BAUDRATECONST;
                callBack({
                    result: "ok",
                    connectionInfo: "波特率为空或者非法，使用默认波特率 " + BAUDRATECONST + " ！"
                });
            } else {
                baudRate = brate;
                callBack({
                    result: "ok",
                    connectionInfo: "波特率 " + brate + " 设置成功！"
                });
            }
        }
    }

    this.openPort = function(callBack) {
        if (isSerialPortOpen === false) {
            var portInfo = {
                portName: portNameInfo,
                bitrate: baudRate,
                dataBits: "eight",
                parityBit: "no",
                stopBits: "one"
            }
            chrome.runtime.sendMessage(extensionId, {
                cmd: "open",
                portGUID: portGUID,
                info: portInfo
            },
            function(response) {
                if (response.result === "ok") {
                    isSerialPortOpen = true;
                    serialConnectionId = response.connectionInfo.connectionId;
                }
                callBack(response);
            });
        }
    }

    this.closePort = function(callBack) {
        if (isSerialPortOpen === true) {
            chrome.runtime.sendMessage(extensionId, {
                cmd: "close",
                connectionId: serialConnectionId
            },
            function(response) {
                if (response.result === "ok") {
                    isSerialPortOpen = false;
                }
                callBack(response);
            });
        }
    }

    this.getWeight = function(callBack) {

        if (isSerialPortOpen === true) {

            chrome.runtime.sendMessage(extensionId, {
                cmd: "write",
                connectionId: serialConnectionId,
            },
            function(response) {
                var oInterval = setInterval(function() {
                    if (response.result === "ok") {
                        if (response.sendInfo.error !== undefined) {
                            if (response.sendInfo.error === "disconnected" || response.sendInfo.error === "system_error") {
                                isSerialPortOpen = false;
                                closePort(function() {});
                            }
                            callBack(response);
                        } else {
                            if (sValue !== null && ((sValue.length === 5 && baudRate === 2400) || (sValue.length === 12 && baudRate === 9600))) {
                                if (sValue.length === 12) {
                                    //sValue = sValue.substring(1, 11);
                                    sValue = (sValue.substring(1, 2) + sValue.substring(3, 5) + sValue.substring(6, 9) ).replace(/ /g, "0");
                                    if(sValue[0] === "0"){
                                      sValue = sValue.substring(1,6);
                                    }
                                }
                                if (sValue.length === 5) {
                                    sValue = sValue;
                                }

                                clearInterval(oInterval);
                                response.weight = sValue;
                                callBack(response);
                                sValue = null;
                            }
                        }
                    }
                },
                100);

            });
        } else {
            callBack({
                result: "error",
                error: "端口没有打开，无法进行称重！"
            });
        }
    }

}

function isExtensionInstalled(callback) {
    chrome.runtime.sendMessage(extensionId, {
        cmd: "installed"
    },
    function(response) {
        if (response) {
            callback(true);
        } else {
            callback(false);
        }
    });
}