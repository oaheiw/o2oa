MWF.xDesktop.requireApp("process.Xform", "$Input", null, false);
MWF.xApplication.process.Xform.Calendar = MWF.APPCalendar =  new Class({
	Implements: [Events],
	Extends: MWF.APP$Input,
	iconStyle: "calendarIcon",
    options: {
        "moduleEvents": ["queryLoad","postLoad","load","complete", "clear", "change"]
    },
    _loadNode: function(){
        if (this.readonly || this.json.isReadonly){
            this._loadNodeRead();
        }else{
            this._loadNodeEdit();
        }
    },
    setDescriptionEvent: function(){
        if (this.descriptionNode){
            this.descriptionNode.addEvents({
                "mousedown": function(){
                    this.descriptionNode.setStyle("display", "none");
                    this.clickSelect();
                }.bind(this)
            });
        }
    },
    getValue: function(){
        var value = this._getBusinessData();
        if (!value) value = this._computeValue();
        if (value) value = Date.parse(value).format(this.json.format);
        return value || "";
    },
	clickSelect: function(){
        if (!this.calendar){
            MWF.require("MWF.widget.Calendar", function(){
                this.calendar = new MWF.widget.Calendar(this.node.getFirst(), {
                    "style": "xform",
                    "isTime": (this.json.selectType==="datetime" || this.json.selectType==="time"),
                    "timeOnly": (this.json.selectType === "time"),
                    //"target": this.form.node,
                    "target": this.form.app.content,
                    "format": this.json.format,
                    "onComplate": function(){
                        this.validationMode();
                        if(this.validation())this._setBusinessData(this.getInputData("change"));
                        this.fireEvent("complete");
                    }.bind(this),
                    "onChange": function(){
                        this.fireEvent("change");
                    }.bind(this),
                    "onClear": function(){
                        this.validationMode();
                        if(this.validation())this._setBusinessData(this.getInputData("change"));
                        this.fireEvent("clear");
                        if (!this.node.getFirst().get("value")) if (this.descriptionNode)  this.descriptionNode.setStyle("display", "block");
                    }.bind(this),
                    "onShow": function(){
                        if (this.descriptionNode) this.descriptionNode.setStyle("display", "none");
                    }.bind(this),
                    "onHide": function(){
                        if (!this.node.getFirst().get("value")) if (this.descriptionNode)  this.descriptionNode.setStyle("display", "block");
                    }.bind(this)
                });
                this.calendar.show();
            }.bind(this));
        }else{
            this.node.getFirst().focus();
        }
	}
}); 