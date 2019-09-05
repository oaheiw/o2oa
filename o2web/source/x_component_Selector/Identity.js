MWF.xApplication.Selector = MWF.xApplication.Selector || {};
MWF.xDesktop.requireApp("Selector", "Person", null, false);
MWF.xApplication.Selector.Identity = new Class({
	Extends: MWF.xApplication.Selector.Person,
    options: {
        "style": "default",
        "count": 0,
        "title": MWF.xApplication.Selector.LP.selectIdentity,
        "units": [],
        "values": [],
        "dutys": [],
        "zIndex": 1000,
        "expand": false,
        "exclude" : [],
        "expandSubEnable" : true //是否允许展开下一层
    },
    loadSelectItems: function(addToNext){
        if (this.options.units.length){
            this.options.units.each(function(unit){
                if (typeOf(unit)==="string"){
                    this.orgAction.listUnitByKey(function(json){
                        if (json.data.length){
                            json.data.each(function(data){
                                var category = this._newItemCategory("ItemCategory", data, this, this.itemAreaNode);
                            }.bind(this));
                        }
                    }.bind(this), null, unit);
                }else{
                    this.orgAction.getUnit(function(json){
                        if (json.data){
                            var category = this._newItemCategory("ItemCategory", json.data, this, this.itemAreaNode);
                        }
                    }.bind(this), null, unit.distinguishedName);
                    //var category = this._newItemCategory("ItemCategory", unit, this, this.itemAreaNode);
                }

            }.bind(this));
        }else{
            this.orgAction.listTopUnit(function(json){
                json.data.each(function(data){
                    if( !this.isExcluded( data ) ){
                        var category = this._newItemCategory("ItemCategory", data, this, this.itemAreaNode);
                    }
                }.bind(this));
            }.bind(this));
        }
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
        return new MWF.xApplication.Selector.Identity[type](data, selector, item, level)
    },

    _listItemByKey: function(callback, failure, key){
        if (this.options.units.length){
            var units = [];
            this.options.units.each(function(u){
                if (typeOf(u)==="string"){
                    units.push(u);
                }
                if (typeOf(u)==="object"){
                    units.push(u.distinguishedName);
                }
            });
            key = {"key": key, "unitList": units};
        }
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
        return new MWF.xApplication.Selector.Identity.ItemSelected(data, selector, item)
    },
    _listItemByPinyin: function(callback, failure, key){
        if (this.options.units.length){
            var units = [];
            this.options.units.each(function(u){
                if (typeOf(u)==="string"){
                    units.push(u);
                }
                if (typeOf(u)==="object"){
                    units.push(u.distinguishedName);
                }
            });
            key = {"key": key, "unitList": units};
        }
        this.orgAction.listIdentityByPinyin(function(json){
            if (callback) callback.apply(this, [json]);
        }.bind(this), failure, key);
    },
    _newItem: function(data, selector, container, level){
        return new MWF.xApplication.Selector.Identity.Item(data, selector, container, level);
    },
    _newItemSearch: function(data, selector, container, level){
        return new MWF.xApplication.Selector.Identity.SearchItem(data, selector, container, level);
    }
    //_listItemNext: function(last, count, callback){
    //    this.action.listRoleNext(last, count, function(json){
    //        if (callback) callback.apply(this, [json]);
    //    }.bind(this));
    //}
});
MWF.xApplication.Selector.Identity.Item = new Class({
	Extends: MWF.xApplication.Selector.Person.Item,
    _getShowName: function(){
        return this.data.name;
    },
    _getTtiteText: function(){
        return this.data.name+((this.data.unitLevelName) ? "("+this.data.unitLevelName+")" : "");
    },
    _setIcon: function(){
        this.iconNode.setStyle("background-image", "url("+"/x_component_Selector/$Selector/default/icon/personicon.png)");
    },
    getData: function(callback){
        if (!this.data.woPerson){
            this.selector.orgAction.getPerson(function(json){
                this.data.woPerson = json.data;
                if (callback) callback();
            }.bind(this), null, this.data.person)
        }else{
            if (callback) callback();
        }
    }
});
MWF.xApplication.Selector.Identity.SearchItem = new Class({
    Extends: MWF.xApplication.Selector.Identity.Item,
    _getShowName: function(){
        return this.data.name+((this.data.unitLevelName) ? "("+this.data.unitLevelName+")" : "");
    }
});

MWF.xApplication.Selector.Identity.ItemSelected = new Class({
	Extends: MWF.xApplication.Selector.Person.ItemSelected,
    getData: function(callback){
        if (!this.data.woPerson){
            if (this.data.person){
                this.selector.orgAction.getPerson(function(json){
                    this.data.woPerson = json.data;
                    if (callback) callback();
                }.bind(this), function(xhr, text, error){
                    var errorText = error;
                    if (xhr){
                        var json = JSON.decode(xhr.responseText);
                        if (json){
                            errorText = json.message.trim() || "request json error";
                        }else{
                            errorText = "request json error: "+xhr.responseText;
                        }
                    }
                    MWF.xDesktop.notice("error", {x: "right", y:"top"}, errorText);
                    if (callback) callback();
                }.bind(this), this.data.person)
            }else{
                MWF.xDesktop.notice("error", {x: "right", y:"top"}, MWF.SelectorLP.noPerson.replace(/{name}/g, this.data.name));
                if (callback) callback();
            }
        }else{
            if (callback) callback();
        }
    },
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

MWF.xApplication.Selector.Identity.ItemCategory = new Class({
    Extends: MWF.xApplication.Selector.Person.ItemCategory,
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
            debugger;
            if (this.selector.options.dutys && this.selector.options.dutys.length){
                var ids = [];
                this.selector.options.dutys.each(function(duty){
                    this.selector.orgAction.listIdentityWidthUnitWithDutyName(this.data.distinguishedName, duty, function(json){
                        if (json.data && json.data.length) ids = ids.concat(json.data)
                    }.bind(this), null, false);

                    ids.each(function(idSubData){
                        if( !this.selector.isExcluded( idSubData ) ) {
                            var item = this.selector._newItem(idSubData, this.selector, this.children, this.level + 1);
                            this.selector.items.push(item);
                        }
                        if( !this.selector.options.expandSubEnable ){
                            this.loaded = true;
                            if (callback) callback();
                        }
                    }.bind(this));
                }.bind(this));

                if( this.selector.options.expandSubEnable ){
                    this.selector.orgAction.listSubUnitDirect(function(json){
                        json.data.each(function(subData){
                            if( !this.selector.isExcluded( subData ) ) {
                                var category = this.selector._newItemCategory("ItemCategory", subData, this.selector, this.children, this.level + 1);
                            }
                        }.bind(this));
                        this.loaded = true;
                        if (callback) callback();
                    }.bind(this), null, this.data.distinguishedName);
                }
            }else{
                this.selector.orgAction.listIdentityWithUnit(function(idJson){
                    idJson.data.each(function(idSubData){
                        if( !this.selector.isExcluded( idSubData ) ) {
                            var item = this.selector._newItem(idSubData, this.selector, this.children, this.level + 1);
                            this.selector.items.push(item);
                        }
                        if( !this.selector.options.expandSubEnable ){
                            this.loaded = true;
                            if (callback) callback();
                        }
                    }.bind(this));

                    if( this.selector.options.expandSubEnable ){
                        this.selector.orgAction.listSubUnitDirect(function(json){
                            json.data.each(function(subData){
                                if( !this.selector.isExcluded( subData ) ) {
                                    var category = this.selector._newItemCategory("ItemCategory", subData, this.selector, this.children, this.level + 1);
                                }
                            }.bind(this));
                            this.loaded = true;
                            if (callback) callback();
                        }.bind(this), null, this.data.distinguishedName);
                    }
                }.bind(this), null, this.data.distinguishedName);
            }
        }else{
            if (callback) callback( );
        }
    },
    _hasChild: function(){
        var uCount = (this.data.subDirectUnitCount) ? this.data.subDirectUnitCount : 0;
        var iCount = (this.data.subDirectIdentityCount) ? this.data.subDirectIdentityCount : 0;
        return uCount + iCount;
    }

});

MWF.xApplication.Selector.Identity.Filter = new Class({
    Implements: [Options, Events],
    options: {
        "style": "default",
        "units": []
    },
    initialize: function(value, options){
        this.setOptions(options);
        this.value = value;
        this.orgAction = MWF.Actions.get("x_organization_assemble_control");
    },
    filter: function(value, callback){
        this.value = value;
        var key = this.value;
        if (this.options.units.length){
            var units = [];
            this.options.units.each(function(u){
                if (typeOf(u)==="string"){
                    units.push(u);
                }
                if (typeOf(u)==="object"){
                    units.push(u.distinguishedName);
                }
            });
            key = {"key": this.value, "unitList": units};
        }
        var data = null;
        this.orgAction.listIdentityByKey(function(json){
            data = json.data;
            if (callback) callback(data)
        }.bind(this), null, key);
    }
});
