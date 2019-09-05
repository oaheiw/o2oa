MWF.xApplication.Selector = MWF.xApplication.Selector || {};
MWF.xDesktop.requireApp("Selector", "Identity", null, false);
MWF.xApplication.Selector.IdentityWidthDuty = new Class({
	Extends: MWF.xApplication.Selector.Identity,
    options: {
        "style": "default",
        "count": 0,
        "title": MWF.xApplication.Selector.LP.selectIdentity,
        "dutys": [],
        "units": [],
        "values": [],
        "zIndex": 1000,
        "expand": false,
        "expandSubEnable": true,
        "exclude" : []
    },
    loadSelectItems: function(addToNext){
        if (this.options.dutys.length){
            this.options.dutys.each(function(duty){
                var data = {"name": duty, "id":duty};
                var category = this._newItemCategory("ItemCategory",data, this, this.itemAreaNode);
                //category.loadSub();
                //category.clickItem();
                // this.action.getUnitduty(function(dutyData){
                //     var category = this._newItemCategory("ItemCategory", dutyData.data, this, this.itemAreaNode);
                // }.bind(this), null, duty);
            }.bind(this));
        }
    },
    search: function(){
        var key = this.searchInput.get("value");
        if (key){
            this.initSearchArea(true);
            this.searchInItems(key);
        }else{
            this.initSearchArea(false);
        }
    },
    listPersonByPinyin: function(node){
        this.searchInput.focus();
        var pinyin = this.searchInput.get("value");
        pinyin = pinyin+node.get("text");
        this.searchInput.set("value", pinyin);
        this.search();
    },

    checkLoadSelectItems: function(){
        if (!this.options.units.length){
            this.loadSelectItems();
        }else{
            this.loadSelectItems();
        }
    },

    _scrollEvent: function(y){
        return true;
    },
    _getChildrenItemIds: function(){
        return null;
    },
    _newItemCategory: function(type, data, selector, item, level){
        return new MWF.xApplication.Selector.IdentityWidthDuty[type](data, selector, item, level)
    },

    _listItemByKey: function(callback, failure, key){
        if (this.options.units.length) key = {"key": key, "unitList": this.options.units};
        this.orgAction.listIdentityByKey(function(json){
            if (callback) callback.apply(this, [json]);
        }.bind(this), failure, key);
    },
    _getItem: function(callback, failure, id, async){
        this.orgAction.getIdentity(function(json){
            if (callback) callback.apply(this, [json]);
        }.bind(this), failure, ((typeOf(id)==="string") ? id : id.distinguishedName), async);
    },
    _newItemSelected: function(data, selector, item){
        return new MWF.xApplication.Selector.IdentityWidthDuty.ItemSelected(data, selector, item)
    },
    _listItemByPinyin: function(callback, failure, key){
        if (this.options.units.length) key = {"key": key, "unitList": this.options.units};
        this.orgAction.listIdentityByPinyin(function(json){
            if (callback) callback.apply(this, [json]);
        }.bind(this), failure, key);
    },
    _newItem: function(data, selector, container, level){
        return new MWF.xApplication.Selector.IdentityWidthDuty.Item(data, selector, container, level);
    },
    _newItemSearch: function(data, selector, container, level){
        return new MWF.xApplication.Selector.IdentityWidthDuty.SearchItem(data, selector, container, level);
    }
    //_listItemNext: function(last, count, callback){
    //    this.action.listRoleNext(last, count, function(json){
    //        if (callback) callback.apply(this, [json]);
    //    }.bind(this));
    //}
});
MWF.xApplication.Selector.IdentityWidthDuty.Item = new Class({
	Extends: MWF.xApplication.Selector.Identity.Item,
    _getShowName: function(){
        return this.data.name;
    },
    _getTtiteText: function(){
        return this.data.name+((this.data.unitLevelName) ? "("+this.data.unitLevelName+")" : "");
    },
    _setIcon: function(){
        this.iconNode.setStyle("background-image", "url("+"/x_component_Selector/$Selector/default/icon/personicon.png)");
    }
});
MWF.xApplication.Selector.IdentityWidthDuty.SearchItem = new Class({
    Extends: MWF.xApplication.Selector.Identity.Item,
    _getShowName: function(){
        return this.data.name+((this.data.unitLevelName) ? "("+this.data.unitLevelName+")" : "");
    }
});

MWF.xApplication.Selector.IdentityWidthDuty.ItemSelected = new Class({
	Extends: MWF.xApplication.Selector.Identity.ItemSelected,
    _getShowName: function(){
        return this.data.name+((this.data.unitLevelName) ? "("+this.data.unitLevelName+")" : "");
    },
    _getTtiteText: function(){
        return this.data.name+((this.data.unitLevelName) ? "("+this.data.unitLevelName+")" : "");
    },
    _setIcon: function(){
        this.iconNode.setStyle("background-image", "url("+"/x_component_Selector/$Selector/default/icon/personicon.png)");
    }
});

MWF.xApplication.Selector.IdentityWidthDuty.ItemCategory = new Class({
    Extends: MWF.xApplication.Selector.Identity.ItemCategory,
    createNode: function(){
        this.node = new Element("div", {
            "styles": this.selector.css.selectorItemCategory_department
        }).inject(this.container);
    },
    _getShowName: function(){
        return this.data.name;
    },
    _setIcon: function(){
        this.iconNode.setStyle("background-image", "url("+"/x_component_Selector/$Selector/default/icon/companyicon.png)");
    },
    clickItem: function(){
        if (this._hasChild()){
            var firstLoaded = !this.loaded;
            this.loadSub(function(){
                if( firstLoaded ){
                    this.children.setStyles({"display": "block", "height": "auto"});
                    this.actionNode.setStyles(this.selector.css.selectorItemCategoryActionNode_expand);
                }else{
                    var display = this.children.getStyle("display");
                    if (display === "none"){
                        this.children.setStyles({"display": "block", "height": "auto"});
                        this.actionNode.setStyles(this.selector.css.selectorItemCategoryActionNode_expand);

                    }else{
                        this.children.setStyles({"display": "none", "height": "0px"});
                        this.actionNode.setStyles(this.selector.css.selectorItemCategoryActionNode_collapse);
                    }
                }
            }.bind(this));
        }
    },
    loadSub: function(callback){
        if (!this.loaded){
            if (this.selector.options.units.length){
                var action = MWF.Actions.get("x_organization_assemble_express");
                var data = {"name":this.data.name, "unit":""};
                var count = this.selector.options.units.length;
                var i = 0;

                if (this.selector.options.expandSubEnable) {
                    this.selector.options.units.each(function(u){
                        var unitName = ""
                        if (typeOf(u)==="string"){
                            unitName = u;
                        }else{
                            unitName = u.distinguishedName || u.unique || u.id || u.levelName
                        }
                        if (unitName){
                            var unitNames;
                            action.listUnitNameSubNested({"unitList": [unitName]}, function(json){
                                unitNames = json.data.unitList;
                            }.bind(this), null, false);

                            unitNames.push(unitName);
                            if (unitNames && unitNames.length){
                                data.unitList = unitNames;
                                action.getDuty(data, function(json){
                                    json.data.each(function(idSubData){
                                        if( !this.selector.isExcluded( idSubData ) ) {
                                            var item = this.selector._newItem(idSubData, this.selector, this.children, this.level + 1);
                                            this.selector.items.push(item);
                                        }
                                    }.bind(this));
                                }.bind(this), null, false);
                            }
                        }

                        i++;
                        if (i>=count){
                            if (!this.loaded) {
                                this.loaded = true;
                                if (callback) callback();
                            }
                        }
                    }.bind(this));
                }else{
                    this.selector.options.units.each(function(u){
                        if (typeOf(u)==="string"){
                            data.unit = u;
                        }else{
                            data.unit = u.distinguishedName || u.unique || u.id || u.levelName
                        }
                        action.getDuty(data, function(json){
                            json.data.each(function(idSubData){
                                if( !this.selector.isExcluded( idSubData ) ) {
                                    var item = this.selector._newItem(idSubData, this.selector, this.children, this.level + 1);
                                    this.selector.items.push(item);
                                }
                            }.bind(this));
                            i++;
                            if (i>=count){
                                if (!this.loaded) {
                                    this.loaded = true;
                                    if (callback) callback();
                                }
                            }
                        }.bind(this));
                    }.bind(this));
                }
                //if (callback) callback();

            }else{
                this.selector.orgAction.listIdentityWithDuty(function(json){
                    json.data.each(function(idSubData){
                        if( !this.selector.isExcluded( idSubData ) ) {
                            var item = this.selector._newItem(idSubData, this.selector, this.children, this.level + 1);
                            this.selector.items.push(item);
                        }
                    }.bind(this));
                    this.loaded = true;
                    if (callback) callback();
                }.bind(this), null, this.data.name);
            }
        }else{
            if (callback) callback( );
        }
    },
    _hasChild: function(){
        return true;
    }

});

MWF.xApplication.Selector.IdentityWidthDuty.Filter = new Class({
    Implements: [Options, Events],
    options: {
        "style": "default",
        "units": [],
        "dutys": []
    },
    initialize: function(value, options){
        this.setOptions(options);
        this.value = value;
        this.orgAction = MWF.Actions.get("x_organization_assemble_control");
    },
    getList: function(callback){
        if (false && this.list){
            if (callback) callback();
        }else{
            this.list = [];

            MWF.require("MWF.widget.PinYin", function(){
                this.options.dutys.each(function(duty){
                    if (this.options.units.length){
                        var action = MWF.Actions.get("x_organization_assemble_express");
                        var data = {"name":duty, "unit":""};
                        this.options.units.each(function(u){
                            if (typeOf(u)==="string"){
                                data.unit = u;
                            }else{
                                data.unit = u.distinguishedName || u.unique || u.id || u.levelName
                            }
                            action.getDuty(data, function(json){
                                json.data.each(function(d){
                                    d.pinyin = d.name.toPY().toLowerCase();
                                    d.firstPY = d.name.toPYFirst().toLowerCase();
                                    this.list.push(d);
                                }.bind(this));
                            }.bind(this), null, false);
                        }.bind(this));
                    }else{
                        this.orgAction.listIdentityWithDuty(function(json){
                            json.data.each(function(d){
                                d.pinyin = d.name.toPY().toLowerCase();
                                d.firstPY = d.name.toPYFirst().toLowerCase();
                                this.list.push(d);
                            }.bind(this));
                        }.bind(this), null, duty, false);
                    }
                }.bind(this));
                if (callback) callback();

            }.bind(this));
        }
    },
    filter: function(value, callback){
        this.value = value;
        this.getList(function(){
            var data = this.list.filter(function(d){
                var text = d.name+"#"+d.pinyin+"#"+d.firstPY;
                return (text.indexOf(this.value)!=-1);
            }.bind(this));
            if (callback) callback(data);
        }.bind(this));
    }
});