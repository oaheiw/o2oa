MWF.xApplication.Selector = MWF.xApplication.Selector || {};
MWF.xDesktop.requireApp("Selector", "lp."+MWF.language, null, false);
//MWF.xDesktop.requireApp("Selector", "Actions.RestActions", null, false);
MWF.xApplication.Selector.Person = new Class({
    Extends: MWF.widget.Common,
    Implements: [Options, Events],

    options: {
        "style": "default",
        "count": 0,
        "title": MWF.xApplication.Selector.LP.selectPerson,
        "groups": [],
        "roles": [],
        "values": [],
        "exclude" : [],
        "zIndex": 1000,
        "expand": true,
        "embedded" : false,
        "selectAllEnable" : false,

        "level1Indent" : 10,
        "indent" : 10,

        "hasLetter" : true, //字母
        "hasTop" : false, //可选、已选的标题

        "hasShuttle" : false, //穿梭按钮
        "searchbarInTopNode" : true, //搜索框在标题上还是另起一行
        "hasSelectedSearchbar" : false
    },
    initialize: function(container, options){
        this.setOptions(options);

        this.path = "/x_component_Selector/$Selector/";
        this.cssPath = "/x_component_Selector/$Selector/"+this.options.style+"/css.wcss";
        this._loadCss(true);

        this.container = $(container);
        this.orgAction = MWF.Actions.get("x_organization_assemble_control");
        this.processAction = MWF.Actions.get("x_processplatform_assemble_surface");
        this.designerAction = MWF.Actions.get("x_processplatform_assemble_designer");
        this.portalAction = MWF.Actions.get("x_portal_assemble_surface");
        this.portalDesignerAction = MWF.Actions.get("x_portal_assemble_designer");
        this.cmsAction = MWF.Actions.get("x_cms_assemble_control");
        this.queryAction = MWF.Actions.get("x_query_assemble_designer");

        //this.action = new MWF.xApplication.Selector.Actions.RestActions();

        this.lastPeople = "";
        this.pageCount = "13";

        this.selectedItems = []; //所有已选项
        this.items = []; //所有选择项

        this.subCategorys = []; //直接的分类
        this.subItems = []; //直接的选择项
    },
    load: function(){
        this.fireEvent("queryLoad",[this]);
        if (layout.mobile){
            this.loadMobile();
        }else{
            this.loadPc();
        }
        this.fireEvent("load");
    },
    loadMobile: function(){
        this.maskRelativeNode = $(document.body);
        this.maskRelativeNode.mask({
            "destroyOnHide": true,
            "style": this.css.maskNode
        });

        this.node = new Element("div", {"styles": this.css.containerNodeMobile});
        this.node.setStyle("z-index", this.options.zIndex.toInt()+1);
        this.node.setStyle("height", ( document.body.getSize().y ) + "px");
        this.titleNode = new Element("div", {
            "styles": this.css.titleNodeMobile
        }).inject(this.node);

        this.titleCancelActionNode = new Element("div", {
            "styles": this.css.titleCancelActionNodeMobile,
            "text": MWF.SelectorLP.back
        }).inject(this.titleNode);
        this.titleOkActionNode = new Element("div", {
            "styles": this.css.titleOkActionNodeMobile,
            "text": MWF.SelectorLP.ok
        }).inject(this.titleNode);

        this.titleTextNode = new Element("div", {
            "styles": this.css.titleTextNodeMobile,
            "text": this.options.title
        }).inject(this.titleNode);

        this.contentNode = new Element("div", {
            "styles": this.css.contentNode
        }).inject(this.node);

        var size = document.body.getSize();
        var height = size.y-40;
        //var height = size.y;
        this.contentNode.setStyle("height", ""+height+"px");


        this.loadContent();

        this.node.inject(document.body);
        this.node.setStyles({
            "top": "0px",
            "left": "0px"
        });

        this.setEvent();
    },
    setMaskResize: function(){
        var size = this.container.getSize();
        this.mask.resize();
        this.maskInterval = window.setInterval(function(){
            var resize = this.container.getSize();
            if ((size.x!==resize.x) || (size.y!==resize.y)){
                this.mask.position();
                this.mask.resize();
                size.x = resize.x;
                size.y = resize.y;
            }
        }.bind(this), 66);
    },
    loadPc: function(){
        if( this.options.embedded ){
            this.node = new Element("div", {
                "styles": this.css.containerNode_embedded, //(this.options.count.toInt()===1) ? this.css.containerNodeSingle_embedded : this.css.containerNode_embedded,
                "events": {
                    "click": function(e){e.stopPropagation();},
                    "mousedown": function(e){e.stopPropagation();},
                    "mouseover": function(e){e.stopPropagation();},
                    "mouseout": function(e){e.stopPropagation();},
                    "keydown": function(e){e.stopPropagation();}
                }
            });

            this.contentNode = new Element("div", {
                "styles": this.css.contentNode_embedded ? this.css.contentNode_embedded : this.css.contentNode
            }).inject(this.node);

            this.loadContent();

            if( this.options.width || this.options.height ){
                this.setSize()
            }

            this.node.inject(this.container);
        } else {
            this.css.maskNode["z-index"] = this.options.zIndex;
            var position = this.container.getPosition(this.container.getOffsetParent());
            this.mask = new Mask(this.container, {
                "destroyOnHide": true,
                "style": this.css.maskNode,
                "useIframeShim": true,
                "iframeShimOptions": {"browsers": true},
                "onShow": function () {
                    this.shim.shim.setStyles({
                        "opacity": 0,
                        "top": "" + position.y + "px",
                        "left": "" + position.x + "px"
                    });
                }
                //
                // "destroyOnHide": true,
                // "style": this.css.maskNode,
                // "useIframeShim": true,
                // "iframeShimOptions": {"browsers": true},
                // "onShow": function(){
                //     this.shim.shim.setStyles({
                //         "opacity": 0,
                //         "top": ""+position.y+"px",
                //         "left": ""+position.x+"px"
                //     });
                // }
            });
            this.mask.show();
            this.setMaskResize();

            //  this.container.setStyle("z-index", this.options.zIndex);
            this.node = new Element("div", {
                "styles": this.css.containerNode, //(this.options.count.toInt()===1) ? this.css.containerNodeSingle : this.css.containerNode,
                "events": {
                    "click": function(e){e.stopPropagation();},
                    "mousedown": function(e){e.stopPropagation();},
                    "mouseover": function(e){e.stopPropagation();},
                    "mouseout": function(e){e.stopPropagation();},
                    "keydown": function(e){e.stopPropagation();}
                }
            });
            this.node.setStyle("z-index", this.options.zIndex.toInt()+1);
            this.titleNode = new Element("div.titleNode", {
                "styles": this.css.titleNode
            }).inject(this.node);

            this.titleActionNode = new Element("div", {
                "styles": this.css.titleActionNode
            }).inject(this.titleNode);
            this.titleTextNode = new Element("div", {
                "styles": this.css.titleTextNode,
                "text": this.options.title
            }).inject(this.titleNode);

            this.contentNode = new Element("div", {
                "styles": this.css.contentNode
            }).inject(this.node);

            this.loadContent();

            this.actionNode = new Element("div", {
                "styles": this.css.actionNode
            }).inject(this.node);
            //if (this.options.count.toInt() === 1) this.actionNode.setStyle("text-align", "center");
            this.loadAction();

            this.node.inject(this.container);

            this.node.position({
                relativeTo: this.container,
                position: "center",
                edge: "center"
            });

            var size = this.container.getSize();
            var nodeSize = this.node.getSize();
            this.node.makeDraggable({
                "handle": this.titleNode,
                "limit": {
                    "x": [0, size.x - nodeSize.x],
                    "y": [0, size.y - nodeSize.y]
                }
            });

            if( this.options.width || this.options.height ){
                this.setSize()
            }

            this.setEvent();

        }
    },


    setEvent: function(){
        if (this.titleActionNode){
            this.titleActionNode.addEvent("click", function(){
                this.fireEvent("cancel");
                this.close();
            }.bind(this));
        }
        if (this.titleCancelActionNode){
            this.titleCancelActionNode.addEvent("click", function(){
                this.fireEvent("cancel");
                this.close();
            }.bind(this));
        }
        if (this.titleOkActionNode){
            this.titleOkActionNode.addEvent("click", function(){
                this.fireEvent("complete", [this.selectedItems]);
                this.close();
            }.bind(this));
        }
    },
    close: function(){
        this.fireEvent("close");
        this.node.destroy();
        //if (this.mask) this.mask.hide();
        if( !this.options.embedded ){
            (this.maskRelativeNode || this.container).unmask();
        }
        if (this.maskInterval){
            window.clearInterval(this.maskInterval);
            this.maskInterval = null;
        }
        MWF.release(this);
        delete this;
    },
    loadAction: function(){
        this.okActionNode = new Element("button", {
            "styles": this.css.okActionNode,
            "text": MWF.SelectorLP.ok
        }).inject(this.actionNode);
        this.cancelActionNode = new Element("button", {
            "styles": this.css.cancelActionNode,
            "text": MWF.SelectorLP.cancel
        }).inject(this.actionNode);
        this.okActionNode.addEvent("click", function(){
            this.fireEvent("complete", [this.selectedItems]);
            this.close();
        }.bind(this));
        this.cancelActionNode.addEvent("click", function(){this.fireEvent("cancel"); this.close();}.bind(this));
    },
    loadContent: function( contentNode ){
        if( contentNode )this.contentNode = contentNode;
        if (layout.mobile){
            if (this.options.count.toInt()!==1) this.loadSelectedNodeMobile();
            this.loadSelectNodeMobile();
        }else{
            this.loadSelectNode();
            if( this.options.hasShuttle ){
                this.loadShuttleNode();
            }
            //if (this.options.count.toInt()!==1) this.loadSelectedNode();
            this.loadSelectedNode();
        }
    },
    loadSelectNodeMobile: function(){
        this.selectNode = new Element("div", {
            "styles": this.css.selectNodeMobile
        }).inject(this.contentNode);

        var containerSize = this.container.getSize();
        var bodySize = $(document.body).getSize();

        var size = {
            "x" : Math.min( containerSize.x, bodySize.x ),
            "y" : Math.min( containerSize.y, bodySize.y )
        };

        var isFormWithAction = window.location.href.toLowerCase().indexOf("workmobilewithaction.html") > -1;

        var height;
        if( isFormWithAction ){
            height = size.y-40-20-6-20;
        }else{
            height = size.y;
        }
        this.selectNode.setStyle("height", ""+height+"px");

        this.searchInputDiv = new Element("div", {
            "styles": this.css.searchInputDiv
        }).inject(this.selectNode);
        this.searchInput = new Element("input", {
            "styles": (this.options.count.toInt()===1) ? this.css.searchInputSingle : this.css.searchInput,
            "type": "text"
        }).inject(this.searchInputDiv);
        var width = size.x-20-18;
        this.searchInput.setStyle("width", ""+width+"px");
        this.searchInput.setStyle("height", "20px");
        this.initSearchInput();

        this.letterAreaNode = new Element("div", {
            "styles": this.css.letterAreaMobileNode
        }).inject(this.selectNode);
        width = size.x-18;
        this.letterAreaNode.setStyle("width", ""+width+"px");
        this.loadLetters();

        this.itemAreaScrollNode = new Element("div.itemAreaScrollNode", {
            "styles": this.css.itemAreaScrollNode
        }).inject(this.selectNode);

        if( isFormWithAction ){
            height = size.y-40-20-78-20;
        }else{
            height = size.y-42-31-40;
        }
        this.itemAreaScrollNode.setStyle("height", ""+height+"px");
        this.itemAreaScrollNode.setStyle("overflow", "auto");

        this.itemAreaNode = new Element("div", {
            "styles": this.css.itemAreaNode
        }).inject(this.itemAreaScrollNode);
        this.itemSearchAreaNode = new Element("div", {
            "styles": this.css.itemAreaNode
        }).inject(this.itemAreaScrollNode);
        this.itemSearchAreaNode.setStyle("display", "none");

        //MWF.require("MWF.widget.ScrollBar", function(){
        //    var _self = this;
        //    new MWF.widget.ScrollBar(this.itemAreaScrollNode, {
        //        "style":"xApp_Organization_Explorer",
        //        "where": "before",
        //        "distance": 30,
        //        "friction": 4,
        //        "axis": {"x": false, "y": true},
        //        "onScroll": function(y){
        //            _self._scrollEvent(y);
        //        }
        //    });
        //}.bind(this));
        this.initLoadSelectItems();
        this.checkLoadSelectItems();
    },
    checkLoadSelectItems: function(){
        if (!this.options.groups.length && !this.options.roles.length){
            this.loadSelectItems();
        }else{
            this.loadSelectItemsByCondition();
        }
    },

    loadShuttleNode : function(){
        this.shuttleNode = new Element("div.shuttleNode", {
            "styles": this.css.shuttleNode
        }).inject(this.contentNode);

        this.shuttleInnerNode = new Element("div.shuttleInnerNode", {
            "styles": this.css.shuttleInnerNode
        }).inject(this.shuttleNode);

        this.goRightNode = new Element("div.goRightNode", {
            "styles": this.css.goRightNode
        }).inject(this.shuttleInnerNode);

        this.goLeftNode = new Element("div.goLeftNode", {
            "styles": this.css.goLeftNode
        }).inject(this.shuttleInnerNode);

    },

    loadSelectNode: function(){
        this.selectNode = new Element("div.selectNode", {
            "styles": this.css.selectNode //(this.options.count.toInt()===1) ? this.css.selectNodeSingle : this.css.selectNode
        }).inject(this.contentNode);

        if( this.options.hasTop ){ //if( this.options.embedded && this.options.count.toInt()!==1 ){
            this.selectTopNode = new Element("div.selectTopNode",{
                "styles" : this.css.selectTopNode
            }).inject( this.selectNode );
            this.selectTopTextNode = new Element("div",{
                "text" : MWF.SelectorLP.waitingSelect,
                "styles" : this.css.selectTopTextNode
            }).inject( this.selectTopNode );
        }

        if( this.options.searchbarInTopNode ){
            this.searchInputDiv = new Element("div", {
                "styles": this.css.searchInputDiv
            }).inject( this.selectTopNode || this.selectNode);
        }else{
            this.searchInputDiv = new Element("div.searchInputDiv", {
                "styles": this.css.searchInputDiv
            }).inject( this.selectNode);
        }
        this.searchInput = new Element("input", {
            "styles": this.css.searchInput, //(this.options.count.toInt()===1) ? this.css.searchInputSingle : this.css.searchInput,
            "placeholder" : MWF.SelectorLP.searchDescription,
            "type": "text"
        }).inject(this.searchInputDiv);
        this.initSearchInput();

        if( this.options.hasLetter ){
            this.letterAreaNode = new Element("div", {
                "styles": this.css.letterAreaNode
            }).inject(this.selectNode);
            this.loadLetters();
        }

        this.itemAreaScrollNode = new Element("div", {
            "styles": this.css.itemAreaScrollNode
        }).inject(this.selectNode);

        this.itemAreaNode = new Element("div", {
            "styles": this.css.itemAreaNode
        }).inject(this.itemAreaScrollNode);
        this.itemSearchAreaNode = new Element("div", {
            "styles": this.css.itemAreaNode
        }).inject(this.itemAreaScrollNode);
        this.itemSearchAreaNode.setStyle("display", "none");

        this.loadSelectNodeScroll();
        this.initLoadSelectItems();
        this.checkLoadSelectItems();
    },
    loadSelectNodeScroll: function(){
        var overflowY = this.itemAreaScrollNode.getStyle("overflow-y");
        if( typeOf(overflowY)==="string" && (overflowY.toLowerCase() === "auto" || overflowY.toLowerCase() === "scroll") )return;
        MWF.require("MWF.widget.ScrollBar", function(){
            var _self = this;
            new MWF.widget.ScrollBar(this.itemAreaScrollNode, {
                "style":"xApp_Organization_Explorer",
                "where": "before",
                "distance": 30,
                "friction": 4,
                "axis": {"x": false, "y": true},
                "onScroll": function(y){
                    _self._scrollEvent(y);
                }
            });
        }.bind(this));
    },
    initSearchInput: function(){
        this.searchInput.addEvents({
            "keydown": function(e){
                var iTimerID = this.searchInput.retrieve("searchTimer", null);
                if (iTimerID){
                    window.clearTimeout(iTimerID);
                    this.searchInput.eliminate("searchTimer");
                }

                iTimerID = window.setTimeout(function(){
                    this.search();
                }.bind(this), 800);

                this.searchInput.store("searchTimer", iTimerID);
            }.bind(this),
            "change": function(e){
                var key = this.searchInput.get("value");
                if (!key) this.initSearchArea(false);
            }.bind(this),
            "blur": function(){
                var key = this.searchInput.get("value");
                if (!key) this.initSearchArea(false);
            }.bind(this)
        });
    },

    initSearchArea: function(flag){
        if (flag){
            this.itemSearchAreaNode.empty();
            this.itemAreaNode.setStyle("display", "none");
            this.itemSearchAreaNode.setStyle("display", "block");
        }else{
            this.itemAreaNode.setStyle("display", "block");
            this.itemSearchAreaNode.setStyle("display", "none");
        }
    },

    search: function(){
        if (!this.options.groups.length && !this.options.roles.length){
            var key = this.searchInput.get("value");
            if (key){
                this._listItemByKey(function(json){
                    this.initSearchArea(true);
                    json.data.each(function(data){
                        this._newItemSearch(data, this, this.itemSearchAreaNode);
                        //this._newItem(data, this, this.itemSearchAreaNode);
                    }.bind(this));
                }.bind(this), null, key);
            }else{
                this.initSearchArea(false);
            }
        }else{
            var key = this.searchInput.get("value");
            if (key){
                this.initSearchArea(true);
                this.searchInItems(key);
            }else{
                this.initSearchArea(false);
            }
        }
    },
    searchInItems: function(key){

        var createdId = [];
        this.createItemsSearchData(function(){
            var word = key.toLowerCase();

            this.itemsSearchData.each(function(obj){
                var text = obj.text+"#"+obj.pinyin+"#"+obj.firstPY;
                if (text.indexOf(word)!==-1){
                    if (createdId.indexOf(obj.data.distinguishedName)===-1){
                        this._newItem(obj.data, this, this.itemSearchAreaNode);
                        createdId.push(obj.data.distinguishedName);
                    }
                }
            }.bind(this));

            //delete createdId;
        }.bind(this));
        return createdId;
    },
    createItemsSearchData: function(callback){
        if (!this.itemsSearchData){
            this.itemsSearchData = [];
            MWF.require("MWF.widget.PinYin", function(){
                var initIds = [];
                this.items.each(function(item){
                    if (initIds.indexOf(item.data.distinguishedName)==-1){
                        var text = item._getShowName().toLowerCase();
                        var pinyin = text.toPY().toLowerCase();
                        var firstPY = text.toPYFirst().toLowerCase();
                        this.itemsSearchData.push({
                            "text": text,
                            "pinyin": pinyin,
                            "firstPY": firstPY,
                            "data": item.data
                        });
                        initIds.push(item.data.distinguishedName);
                    }
                }.bind(this));
                delete initIds;
                if (callback) callback();
            }.bind(this));
        }else{
            if (callback) callback();
        }
    },


    initSelectedSearchInput: function(){
        this.selectedSearchInput.addEvents({
            "keydown": function(e){
                var iTimerID = this.selectedSearchInput.retrieve("searchTimer", null);
                if (iTimerID){
                    window.clearTimeout(iTimerID);
                    this.selectedSearchInput.eliminate("searchTimer");
                }

                iTimerID = window.setTimeout(function(){
                    this.selectedSearch();
                }.bind(this), 800);

                this.selectedSearchInput.store("searchTimer", iTimerID);
            }.bind(this),
            "change": function(e){
                var key = this.selectedSearchInput.get("value");
                if (!key) this.selectedSearch();
            }.bind(this),
            "blur": function(){
                var key = this.selectedSearchInput.get("value");
                if (!key) this.selectedSearch();
            }.bind(this)
        });
    },

    selectedSearch: function(){
        var key = this.selectedSearchInput.get("value");
        if (key){
            this.selectedSearchInItems(key);
        }else{
            this.showAllSelectedItem()
        }
    },
    selectedSearchInItems: function(key){
        var word = key.toLowerCase();
        MWF.require("MWF.widget.PinYin", function() {
            this.selectedItems.each(function (item) {
                if (!item.searchedText) {
                    var text = item._getShowName().toLowerCase();
                    var pinyin = text.toPY().toLowerCase();
                    var firstPY = text.toPYFirst().toLowerCase();
                    item.searchedText = text + "#" + pinyin + "#" + firstPY
                }
                if (item.searchedText.indexOf(word) !== -1) {
                    item.node.show()
                } else {
                    item.node.hide()
                }
            }.bind(this));
        }.bind(this), null, false);
    },
    showAllSelectedItem: function(){
        this.selectedItems.each(function(item){
            item.node.show()
        })
    },

    loadSelectedNode: function(){
        this.selectedContainerNode = new Element("div", {
            "styles": this.css.selectedContainerNode
        }).inject(this.contentNode);

        //if( this.options.embedded && this.options.count.toInt()!==1 ){
        if( this.options.hasTop ){
            this.selectedTopNode = new Element("div",{
                "styles" : this.css.selectedTopNode
            }).inject( this.selectedContainerNode );
            this.selectedTopTextNode = new Element("div",{
                "text" : MWF.SelectorLP.selected,
                "styles" : this.css.selectedTopTextNode
            }).inject( this.selectedTopNode );

            this.emptySelectedNode = new Element("div",{
                "text" : MWF.SelectorLP.empty,
                "styles" : this.css.selectedTopActionNode,
                "events" : {
                    "click" : function(){
                        this.emptySelectedItems()
                    }.bind(this)
                }
            }).inject( this.selectedTopNode );
        }

        if( this.options.hasSelectedSearchbar ){
            if( this.options.searchbarInTopNode ){
                this.selectedSearchInputDiv = new Element("div", {
                    "styles": this.css.searchInputDiv
                }).inject( this.selectedTopNode || this.selectedContainerNode);
            }else{
                this.selectedSearchInputDiv = new Element("div.selectedSearchInputDiv", {
                    "styles": this.css.searchInputDiv
                }).inject( this.selectedContainerNode);
            }
            this.selectedSearchInput = new Element("input", {
                "styles": this.css.searchInput, //(this.options.count.toInt()===1) ? this.css.searchInputSingle : this.css.searchInput,
                "placeholder" : MWF.SelectorLP.searchDescription,
                "type": "text"
            }).inject(this.selectedSearchInputDiv);
            this.initSelectedSearchInput();
        }

        this.selectedScrollNode = new Element("div.selectedScrollNode", {
            "styles": this.css.selectedScrollNode
        }).inject(this.selectedContainerNode);

        this.selectedNode = new Element("div.selectedNode", {
            "styles": this.css.selectedNode
        }).inject(this.selectedScrollNode);

        if( this.options.hasSelectedSearchbar ){
            this.selectedItemSearchAreaNode = new Element("div", {
                "styles": this.css.itemAreaNode
            }).inject(this.selectedScrollNode);
            this.selectedItemSearchAreaNode.setStyle("display", "none");
        }

        this.setSelectedItem();

        this.loadSelectedNodeScroll();
    },
    emptySelectedItems : function(){
        while (this.selectedItems.length){
            this.selectedItems[0].clickItem();
        }
    },
    loadSelectedNodeScroll: function(){
        var overflowY = this.selectedScrollNode.getStyle("overflow-y");
        if( typeOf(overflowY)==="string" && (overflowY.toLowerCase() === "auto" || overflowY.toLowerCase() === "scroll") )return;
        MWF.require("MWF.widget.ScrollBar", function(){
            var _self = this;
            new MWF.widget.ScrollBar(this.selectedScrollNode, {
                "style":"xApp_Organization_Explorer", "where": "before", "distance": 100, "friction": 4,"axis": {"x": false, "y": true}
            });
        }.bind(this));
    },

    loadSelectedNodeMobile: function(){
        this.selectedScrollNode = new Element("div", {
            "styles": this.css.selectedScrollNode
        }).inject(this.contentNode);

        this.selectedNode = new Element("div", {
            "styles": this.css.selectedNode
        }).inject(this.selectedScrollNode);

        this.setSelectedItem();

        MWF.require("MWF.widget.ScrollBar", function(){
            var _self = this;
            new MWF.widget.ScrollBar(this.selectedScrollNode, {
                "style":"xApp_Organization_Explorer", "where": "before", "distance": 100, "friction": 4,"axis": {"x": false, "y": true}
            });
        }.bind(this));
        this.selectedScrollNode.setStyle("display", "none");
    },

    setSelectedItem: function(){
        if (this.options.values.length){
            this.options.values.each(function(v, i){
                if (typeOf(v)==="object"){
                    this.selectedItems.push(this._newItemSelected(v, this, null));
                }else{
                    this._getItem(function(json){
                        this.options.values[i] = json.data;
                        this.selectedItems.push(this._newItemSelected(json.data, this, null));
                    }.bind(this), null, v, false);
                }
                // this._getItem(function(json){
                // 	this.selectedItems.push(this._newItemSelected(json.data, this, null));
                // }.bind(this), null, v, false);
            }.bind(this));
        }
    },
    loadLetters: function(){
        var _self = this;
        letters = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

        if (layout.mobile){
            var size = this.container.getSize();
            var w = (layout.mobile) ? (size.x-18)/13 : (size.x-20-4-18)/13;
            //letterNode.setStyle("width", ""+w+"px");
            this.css.letterNode.width = ""+w+"px";
            this.css.letterNode_over.width = ""+w+"px";
        }

        letters.each(function(l){
            var letterNode = new Element("div", {
                "styles": this.css.letterNode,
                "text": l
            }).inject(this.letterAreaNode);

            if (layout.mobile){
                letterNode.addEvents({
                    "click": function(){
                        _self.listPersonByPinyin(this);
                    }
                });
            }else{
                letterNode.addEvents({
                    "mouseover": function(e){
                        e.target.setStyles(this.css.letterNode_over);
                        var showNode = new Element("div", {
                            "styles": this.css.letterShowNode,
                            "text": e.target.get("text")
                        }).inject(this.selectNode);
                        showNode.position({
                            relativeTo: this.itemAreaScrollNode,
                            position: "center",
                            edge: "center"
                        });
                        e.target.store("showNode", showNode);
                    }.bind(this),
                    "mouseout": function(e){
                        var showNode = e.target.retrieve("showNode");
                        showNode.destroy();
                        e.target.setStyles(this.css.letterNode);
                    }.bind(this),
                    "click": function(){
                        _self.listPersonByPinyin(this);
                    }
                });
            }

        }.bind(this));
    },

    listPersonByPinyin: function(node){
        this.searchInput.focus();
        var pinyin = this.searchInput.get("value");
        pinyin = pinyin+node.get("text");
        this.searchInput.set("value", pinyin);

        if (!this.options.groups.length && !this.options.roles.length){
            if (pinyin){
                this._listItemByPinyin(function(json){
                    this.initSearchArea(true);
                    json.data.each(function(data){
                        // var flag = true;
                        // if (this.options.departments){
                        //     if (this.options.departments.length){
                        //         if (this.options.departments.indexOf(data.departmentName)==-1) flag = false;
                        //     }
                        // }
                        // if (this.options.companys){
                        //     if (this.options.companys.length){
                        //         if (this.options.companys.indexOf(data.company)==-1) flag = false;
                        //     }
                        // }
                        if( !this.isExcluded( data ) ) {
                            this._newItemSearch(data, this, this.itemSearchAreaNode);
                        }
                        //this._newItem(data, this, this.itemSearchAreaNode);
                        //this._newItem(data, this, this.itemSearchAreaNode);
                    }.bind(this));
                }.bind(this), null, pinyin.toLowerCase());
            }
        }else{
            if (pinyin){
                this.initSearchArea(true);
                this.searchInItems(pinyin);
            }else{
                this.initSearchArea(false);
            }
        }
    },
    initLoadSelectItems: function(){
        this.loaddingItems = false;
        this.isItemLoaded = false;
        this.loadItemsQueue = 0;
        this.initSearchArea(false);
    },
    //loadSelectItems: function(addToNext){
    //    if (!this.isItemLoaded){
    //        if (!this.loaddingItems){
    //            this.loaddingItems = true;
    //            var count = 20;
    //            this._listItemNext(this.getLastLoadedItemId(), count, function(json){
    //                if (json.data.length){
    //                    json.data.each(function(data){
    //                        var item = this._newItem(data, this, this.itemAreaNode);
    //                        this.items.push(item);
    //                    }.bind(this));
    //                    this.loaddingItems = false;
    //
    //                    if (json.data.length<count){
    //                        this.isItemLoaded = true;
    //                    }else{
    //                        if (this.loadItemsQueue>0){
    //                            this.loadItemsQueue--;
    //                            this.loadSelectItems();
    //                        }
    //                    }
    //                }else{
    //                    this.isItemLoaded = true;
    //                    this.loaddingItems = false;
    //                }
    //            }.bind(this));
    //        }else{
    //            if (addToNext) this.loadItemsQueue++;
    //        }
    //    }
    //},
    loadSelectItems: function(addToNext, lastExcludeCount ){
        //lastExcludeCount 参数：表示本次加载是为了补足上次load的时候被排除的数量
        if (!this.isItemLoaded){
            if (!this.loaddingItems){
                this.loaddingItems = true;
                var count = 20;
                this._listItemNext(this.getLastLoadedItemId(), count, function(json){
                    if (json.data.length){
                        var excludedCount = 0;
                        json.data.each(function(data, i){
                            if( this.isExcluded( data ) ){
                                excludedCount++;
                                if( i+1 === count )this.tailExcludeItemId = data.distinguishedName
                            }else{
                                var item = this._newItem(data, this, this.itemAreaNode);
                                this.items.push(item);
                                if( i+1 === count )this.tailExcludeItemId = null;
                            }
                        }.bind(this));
                        this.loaddingItems = false;

                        if( lastExcludeCount ){ //如果是因为上次load的时候被排除而加载的
                            if( count - lastExcludeCount - excludedCount < 0 ){ //如果本次load的数量还不够补足排除的数量，需要再次load
                                excludedCount = lastExcludeCount + excludedCount - count; //把不足的数量作为再次load的参数
                                this.loadItemsQueue++
                            }
                        }else if( excludedCount > 0  ){ //把排除的数量作为再次load的参数
                            this.loadItemsQueue++
                        }
                        if (json.data.length<count){
                            this.isItemLoaded = true;
                        }else{
                            if (this.loadItemsQueue>0){
                                this.loadItemsQueue--;
                                this.loadSelectItems( addToNext, excludedCount );
                            }
                        }
                    }else{
                        this.isItemLoaded = true;
                        this.loaddingItems = false;
                    }
                }.bind(this));
            }else{
                if (addToNext) this.loadItemsQueue++;
            }
        }
    },
    getLastLoadedItemId: function(){
        if( this.tailExcludeItemId )return this.tailExcludeItemId;
        return (this.items.length) ? this.items[this.items.length-1].data.distinguishedName : "(0)";
    },

    //loadSelectItemsByCondition: function(){
    //    this.options.groups.each(function(group){
    //
    //        this.orgAction.listGroupByKey(function(json){
    //            if (json.data.length){
    //                var groupData = json.data[0];
    //                var category = this._newItemCategory("ItemGroupCategory", groupData, this, this.itemAreaNode);
    //                this._getChildrenItemIds(groupData).each(function(id){
    //                    this._getItem(function(json){
    //                        var item = this._newItem(json.data, this, category.children);
    //                        this.items.push(item);
    //                    }.bind(this), null, id);
    //                }.bind(this));
    //            }
    //        }.bind(this), null, group);
    //    }.bind(this));
    //
    //    this.options.roles.each(function(role){
    //        this.orgAction.listRoleByKey(function(json){
    //            if (json.data.length){
    //                var roleData = json.data[0];
    //                var category = this._newItemCategory("ItemRoleCategory", roleData, this, this.itemAreaNode);
    //                this._getChildrenItemIds(roleData).each(function(id){
    //                    this._getItem(function(json){
    //                        var item = this._newItem(json.data, this, category.children);
    //                        this.items.push(item);
    //                    }.bind(this), null, id)
    //                }.bind(this));
    //            }
    //        }.bind(this), null, role);
    //    }.bind(this));
    //},
    loadSelectItemsByCondition: function(){
        this.options.groups.each(function(group){
            this.orgAction.listGroupByKey(function(json){
                if (json.data.length){
                    var groupData = json.data[0];
                    var category = this._newItemCategory("ItemGroupCategory", groupData, this, this.itemAreaNode);
                    this.subCategorys.push(category);
                    this._getChildrenItemIds(groupData).each(function(id){
                        this._getItem(function(json){
                            if( !this.isExcluded( json.data ) ) {
                                var item = this._newItem(json.data, this, category.children);
                                this.items.push(item);
                            }
                        }.bind(this), null, id);
                    }.bind(this));
                }
            }.bind(this), null, group);
        }.bind(this));

        this.options.roles.each(function(role){
            this.orgAction.listRoleByKey(function(json){
                if (json.data.length){
                    var roleData = json.data[0];
                    var category = this._newItemCategory("ItemRoleCategory", roleData, this, this.itemAreaNode);
                    this.subCategorys.push(category);
                    this._getChildrenItemIds(roleData).each(function(id){
                        this._getItem(function(json){
                            if( !this.isExcluded( json.data ) ) {
                                var item = this._newItem(json.data, this, category.children);
                                this.items.push(item);
                            }
                        }.bind(this), null, id)
                    }.bind(this));
                }
            }.bind(this), null, role);
        }.bind(this));
    },
    isExcluded : function( d ){
        if( this.options.exclude.length === 0 )return false;
        if( !this.excludeFlagMap ){
            this.excludeFlagMap = {};
            this.options.exclude.each( function( e ){
                if( !e )return;
                this.excludeFlagMap[ typeOf( e ) === "string" ? e : ( e.distinguishedName || e.id || e.unique || e.employee || e.levelName) ] = true;
            }.bind(this));
        }
        var map = this.excludeFlagMap;
        return ( d.distinguishedName && map[ d.distinguishedName ] ) ||
            ( d.id && map[ d.id ] ) ||
            ( d.unique && map[ d.unique ] ) ||
            ( d.employee && map[ d.employee ] ) ||
            ( d.levelName && map[ d.levelName ] );
    },
    _getChildrenItemIds: function(data){
        return data.personList;
    },
    _newItemCategory: function(type, data, selector, item){
        return new MWF.xApplication.Selector.Person[type](data, selector, item)
    },

    _listItemByKey: function(callback, failure, key){
        this.orgAction.listPersonByKey(function(json){
            if (callback) callback.apply(this, [json]);
        }.bind(this), failure, key);
    },
    _getItem: function(callback, failure, id, async){

        this.orgAction.getPerson(function(json){
            if (callback) callback.apply(this, [json]);
        }.bind(this), failure, ((typeOf(id)==="string") ? id : id.distinguishedName), async);
    },
    _newItemSelected: function(data, selector, item){
        return new MWF.xApplication.Selector.Person.ItemSelected(data, selector, item)
    },
    _listItemByPinyin: function(callback, failure, key){
        this.orgAction.listPersonByPinyin(function(json){
            if (callback) callback.apply(this, [json]);
        }.bind(this), failure, key);
    },
    _newItem: function(data, selector, container){
        return new MWF.xApplication.Selector.Person.Item(data, selector, container);
    },
    _newItemSearch: function(data, selector, container){
        return this._newItem(data, selector, container);
    },
    _listItemNext: function(last, count, callback){
        this.orgAction.listPersonNext(last, count, function(json){
            if (callback) callback.apply(this, [json]);
        }.bind(this));
    },
    _scrollEvent: function(y){
        if (!this.options.groups.length && !this.options.roles.length){
            var scrollSize = this.itemAreaScrollNode.getScrollSize();
            var clientSize = this.itemAreaScrollNode.getSize();
            var scrollHeight = scrollSize.y-clientSize.y;
            if (y+30>scrollHeight) {
                if (!this.isItemLoaded) this.loadSelectItems();
            }
        }
    },
    setSize : function(){
        if( !this.options.width && !this.options.height )return;

        var getOffsetX = function(node){
            return (node.getStyle("margin-left").toInt() || 0 )+
                (node.getStyle("margin-right").toInt() || 0 ) +
                (node.getStyle("padding-left").toInt() || 0 ) +
                (node.getStyle("padding-right").toInt() || 0 ) +
                (node.getStyle("border-left-width").toInt() || 0 ) +
                (node.getStyle("border-right-width").toInt() || 0 );
        };

        var getOffsetY = function(node){
            return (node.getStyle("margin-top").toInt() || 0 ) +
                (node.getStyle("margin-bottom").toInt() || 0 ) +
                (node.getStyle("padding-top").toInt() || 0 ) +
                (node.getStyle("padding-bottom").toInt() || 0 )+
                (node.getStyle("border-top-width").toInt() || 0 ) +
                (node.getStyle("border-bottom-width").toInt() || 0 );
        };


        if( this.options.width && this.options.width === "auto" ){
            //if (this.options.count.toInt() !== 1){
                if( this.node )this.node.setStyle("width", "auto");

                this.selectNode.setStyles({
                    "width": "50%",
                    "float" : "left"
                });
                //this.searchInput.setStyle("width", "99%");
                if(this.letterAreaNode ){
                    this.letterAreaNode.setStyle("width", "auto");
                }

                this.selectedContainerNode.setStyle("width", "auto");
                var overflowY = this.selectedScrollNode.getStyle("overflow-y");
                if( typeOf(overflowY)==="string" && (overflowY.toLowerCase() === "auto" || overflowY.toLowerCase() === "scroll") ){
                    this.selectedScrollNode.setStyle("width", "auto");
                }else{
                    this.selectedScrollNode.setStyle("margin-right", "8px");
                }
            //}else{
            //    this.node.setStyle("width", "auto");
            //    this.selectNode.setStyle("width", "auto");
            //}

        }else if( this.options.width && typeOf( this.options.width.toInt() ) === "number" ){
            var nodeWidth;
            if( this.node ){
                nodeWidth = this.options.width.toInt() - getOffsetX(this.node);
                this.node.setStyle("width", nodeWidth);
            }else{
                nodeWidth = this.options.width.toInt();
            }

            nodeWidth = nodeWidth - getOffsetX( this.contentNode );

            if( this.shuttleNode ){
                nodeWidth = nodeWidth - getOffsetX(this.shuttleNode) - this.shuttleNode.getStyle("width").toInt();
            }

            //if (this.options.count.toInt() !== 1){
                var width = nodeWidth - getOffsetX(this.selectNode) - getOffsetX(this.selectedContainerNode);
                var halfWidth = Math.floor(width / 2);
                this.selectNode.setStyle("width", halfWidth);
                //this.searchInput.setStyle("width", halfWidth - 6);
                if(this.letterAreaNode ){
                    this.letterAreaNode.setStyle("width", halfWidth - 19);
                }

                this.selectedContainerNode.setStyle("width", halfWidth);

                var overflowY = this.selectedScrollNode.getStyle("overflow-y");
                if( typeOf(overflowY)==="string" && (overflowY.toLowerCase() === "auto" || overflowY.toLowerCase() === "scroll") ){
                    this.selectedScrollNode.setStyle("width", halfWidth);
                }else{
                    this.selectedScrollNode.setStyle("width", halfWidth - 8);
                }
            //}else{
            //    var width = nodeWidth - getOffsetX(this.selectNode);
            //    this.selectNode.setStyle("width", width);
            //}
        }

        if( this.options.height && typeOf( this.options.height.toInt() ) === "number" ){
            var nodeHeight;
            if( this.node ){
                nodeHeight = this.options.height.toInt() - getOffsetY(this.node);
                this.node.setStyle("height", nodeHeight);
            }else{
                nodeHeight = this.options.height.toInt();
            }

            nodeHeight = nodeHeight - getOffsetY( this.contentNode );
            if( this.titleNode ){
                nodeHeight = nodeHeight - getOffsetY( this.titleNode ) - this.titleNode.getStyle("height").toInt();
            }

            if( this.actionNode ){
                nodeHeight = nodeHeight - getOffsetY( this.actionNode ) - this.actionNode.getStyle("height").toInt();
            }

            var selectNodeHeight = nodeHeight - getOffsetY(this.selectNode);
            this.selectNode.setStyle("height", selectNodeHeight);

            if( this.shuttleNode ){
                this.shuttleNode.setStyle("height", selectNodeHeight);
                var shuttleInnerHieght = getOffsetY( this.shuttleInnerNode ) + this.shuttleInnerNode.getStyle("height").toInt();
                this.shuttleInnerNode.setStyle("margin-top", (selectNodeHeight-shuttleInnerHieght)/2 +"px" )
            }

            var itemAreaScrollNodeHeight = selectNodeHeight - getOffsetY( this.searchInputDiv ) - this.searchInputDiv.getStyle("height").toInt();
            if( !this.options.searchbarInTopNode && this.selectTopNode ){
                itemAreaScrollNodeHeight = itemAreaScrollNodeHeight - getOffsetY( this.selectTopNode ) - this.selectTopNode.getStyle("height").toInt();
            }
            if(this.letterAreaNode ){
                itemAreaScrollNodeHeight = itemAreaScrollNodeHeight - getOffsetY( this.letterAreaNode ) - this.letterAreaNode.getStyle("height").toInt();
            }
            itemAreaScrollNodeHeight = itemAreaScrollNodeHeight - getOffsetY( this.itemAreaScrollNode );
            this.itemAreaScrollNode.setStyle("height", itemAreaScrollNodeHeight);

            var selectedContainerNodeHeight = nodeHeight - getOffsetY(this.selectedContainerNode);
            this.selectedContainerNode.setStyle("height", selectedContainerNodeHeight);

            var selectedScrollNodeHeight = selectedContainerNodeHeight;
            if( this.selectedTopNode ) {
                selectedScrollNodeHeight = selectedScrollNodeHeight - getOffsetY(this.selectedTopNode) - this.selectedTopNode.getStyle("height").toInt();
            }
            if( !this.options.searchbarInTopNode && this.selectedSearchInputDiv ){
                selectedScrollNodeHeight = selectedScrollNodeHeight - getOffsetY( this.selectedSearchInputDiv ) - this.selectedSearchInputDiv.getStyle("height").toInt();
            }
            this.selectedScrollNode.setStyle("height", selectedScrollNodeHeight);
        }
        this.fireEvent("setSize",[this])
    }
});

MWF.xApplication.Selector.Person.Item = new Class({
    initialize: function(data, selector, container, level, category){
        this.data = data;
        this.selector = selector;
        this.container = container;
        this.isSelected = false;
        this.level = (level) ? level.toInt() : 1;
        this.category = category;
        this.subItems = [];
        this.subCategorys = [];
        this.load();
    },
    _getShowName: function(){
        return this.data.name+"("+this.data.employee+")";
    },
    _getTtiteText: function(){
        return this.data.name+"("+this.data.employee+")";
    },
    _setIcon: function(){
        this.iconNode.setStyle("background-image", "url("+"/x_component_Selector/$Selector/default/icon/personicon.png)");
    },
    load: function(){
        this.selector.fireEvent("queryLoadItem",[this]);

        this.node = new Element("div", {
            "styles": this.selector.css.selectorItem
        }).inject(this.container);

        this.levelNode = new Element("div", {
            "styles": this.selector.css.selectorItemLevelNode
        }).inject(this.node);
        var indent = this.selector.options.level1Indent + (this.level-1)*this.selector.options.indent;
        this.levelNode.setStyle("width", ""+indent+"px");

        this.iconNode = new Element("div", {
            "styles": this.selector.css.selectorItemIconNode
        }).inject(this.node);
        this._setIcon();

        this.actionNode = new Element("div", {
            "styles": this.selector.css.selectorItemActionNode
        }).inject(this.node);

        this.textNode = new Element("div", {
            "styles": this.selector.css.selectorItemTextNode,
            "text": this._getShowName(),
            "title": this._getTtiteText()
        }).inject(this.node);
        var m = this.textNode.getStyle("margin-left").toFloat()+indent;
        this.textNode.setStyle("margin-left", ""+m+"px");

        if(this.postLoad)this.postLoad();

        this.loadSubItem();

        this.setEvent();

        this.check();

        this.selector.fireEvent("postLoadItem",[this]);
    },
    loadSubItem: function(){},
    check: function(){
        //if (this.selector.options.count.toInt()===1){
        //    this.checkSelectedSingle();
        //}else{
            this.checkSelected();
        //}
    },
    checkSelectedSingle: function(){
        var selectedItem = this.selector.options.values.filter(function(item, index){
            if (typeOf(item)==="object") return this.data.distinguishedName === item.distinguishedName;
            if (typeOf(item)==="string") return this.data.distinguishedName === item;
            return false;
        }.bind(this));
        if (selectedItem.length){
            this.selectedSingle();
        }
    },
    checkSelected: function(){
        var selectedItem = this.selector.selectedItems.filter(function(item, index){
            return item.data.distinguishedName === this.data.distinguishedName;
        }.bind(this));
        if (selectedItem.length){
            //selectedItem[0].item = this;
            selectedItem[0].addItem(this);
            this.selectedItem = selectedItem[0];
            this.setSelected();
        }
    },
    setSelected: function(){
        this.isSelected = true;
        this.node.setStyles(this.selector.css.selectorItem_selected);
        this.textNode.setStyles(this.selector.css.selectorItemTextNode_selected);
        this.actionNode.setStyles(this.selector.css.selectorItemActionNode_selected);
    },

    setEvent: function(){
        this.node.addEvents({
            "mouseover": function(){
                this.overItem();
            }.bind(this),
            "mouseout": function(){
                this.outItem();
            }.bind(this),
            "click": function(){
                this.clickItem();
            }.bind(this)
        });
    },
    clickItem: function(){
        //if (this.selector.options.count.toInt()===1){
        //    this.selectedSingle();
        //}else{
            if (this.isSelected){
                this.unSelected();
                this.selector.fireEvent("unselectItem",[this])
            }else{
                this.selected();
                this.selector.fireEvent("selectItem",[this])
            }
        //}
    },
    overItem: function(){
        if (!this.isSelected ){
            this.node.setStyles(this.selector.css.selectorItem_over);
        }else if( this.selector.css.selectorItem_over_force ){
            this.node.setStyles(this.selector.css.selectorItem_over_force);
        }
        if (!this.isSelected){
            this.actionNode.setStyles(this.selector.css.selectorItemActionNode_over);
        }else if( this.selector.css.selectorItemActionNode_over_force ){
            this.node.setStyles(this.selector.css.selectorItemActionNode_over_force);
        }
    },
    outItem: function(){
        if (!this.isSelected){
            this.node.setStyles(this.selector.css.selectorItem);
        }else if( this.selector.css.selectorItem_over_force ){
            this.node.setStyles(this.selector.css.selectorItem_selected);
        }
        if (!this.isSelected){
            this.actionNode.setStyles(this.selector.css.selectorItemActionNode);
        }else if( this.selector.css.selectorItemActionNode_over_force ){
            this.node.setStyles(this.selector.css.selectorItemActionNode_selected);
        }
    },
    selectedSingle: function(){
        if (!this.isSelected){
            if (this.selector.currentItem) this.selector.currentItem.unSelectedSingle();
            this.getData(function(){
                this.selector.currentItem = this;
                this.isSelected = true;
                this.selector.selectedItems.push(this);
                this.node.setStyles(this.selector.css.selectorItem_selected);
                this.textNode.setStyles(this.selector.css.selectorItemTextNode_selected);
                this.actionNode.setStyles(this.selector.css.selectorItemActionNode_selected);
            }.bind(this));
        }else {
            this.unSelectedSingle();
        }
    },
    getData: function(callback){
        if (callback) callback();
    },
    unSelectedSingle: function(){
        this.selector.currentItem = null;
        this.isSelected = false;
        this.selector.selectedItems.erase(this);
        this.node.setStyles(this.selector.css.selectorItem);
        this.textNode.setStyles(this.selector.css.selectorItemTextNode);
        this.actionNode.setStyles(this.selector.css.selectorItemActionNode);
    },
    selected: function(){
        var count = this.selector.options.maxCount || this.selector.options.count;
        if (!count) count = 0;
        if ((count.toInt()===0) || (this.selector.selectedItems.length+1)<=count){
            debugger;
            this.isSelected = true;
            this.node.setStyles(this.selector.css.selectorItem_selected);
            this.textNode.setStyles(this.selector.css.selectorItemTextNode_selected);
            this.actionNode.setStyles(this.selector.css.selectorItemActionNode_selected);
            this.selectedItem = this.selector._newItemSelected(this.data, this.selector, this);
            this.selectedItem.check();
            this.selector.selectedItems.push(this.selectedItem);
        }else{
            MWF.xDesktop.notice("error", {x: "right", y:"top"}, "最多可选择"+count+"个选项", this.node);
        }
    },
    unSelected: function(){
        this.isSelected = false;
        this.node.setStyles(this.selector.css.selectorItem);
        this.textNode.setStyles(this.selector.css.selectorItemTextNode);
        this.actionNode.setStyles(this.selector.css.selectorItemActionNode);

        if (this.selectedItem){
            this.selector.selectedItems.erase(this.selectedItem);

            this.selectedItem.items.each(function(item){
                if (item != this){
                    item.isSelected = false;
                    item.node.setStyles(this.selector.css.selectorItem);
                    item.textNode.setStyles(this.selector.css.selectorItemTextNode);
                    item.actionNode.setStyles(this.selector.css.selectorItemActionNode);
                }
            }.bind(this));

            this.selectedItem.destroy();
            this.selectedItem = null;
        }
    },
    postLoad : function(){},
    getParentCategoryByLevel : function( level ){
        var category = this.category;
        do{
            if( category.level === level ){
                return category;
            }else{
                category = category.category;
            }
        }while( category )
    }
});

MWF.xApplication.Selector.Person.ItemSelected = new Class({
    Extends: MWF.xApplication.Selector.Person.Item,
    initialize: function(data, selector, item){
        this.data = data;
        this.selector = selector;
        this.container = this.selector.selectedNode;
        this.isSelected = false;
        this.items = [];
        if (item) this.items.push(item);
        this.level = 0;
        this.getData(function(){
            this.load();
        }.bind(this));
    },
    postLoad : function(){
        if( this.selector.css.selectorSelectedItemActionNode ){
            this.actionNode.setStyles( this.selector.css.selectorSelectedItemActionNode );
        }
        if( this.selector.css.selectorSelectedItemTextNode ){
            this.textNode.setStyles(this.selector.css.selectorSelectedItemTextNode);
        }
    },
    getData: function(callback){
        if (callback) callback();
    },
    clickItem: function(){
        if (this.items.length){
            this.items.each(function(item){
                item.unSelected();
            });
        }else{
            //this.item.selectedItem = null;
            //this.item.isSelected = false;
            this.destroy();
            this.selector.selectedItems.erase(this);
        }
    },
    //overItem: function(){
    //    if (!this.isSelected){
    //        this.node.setStyles(this.selector.css.selectorItem_over);
    //        this.actionNode.setStyles(this.selector.css.selectorItemActionNode_selected_over);
    //    }
    //},
    overItem: function(){
        if (!this.isSelected ){
            if( this.selector.css.selectorItem_selected_over ){
                this.node.setStyles(this.selector.css.selectorItem_selected_over);
            }else{
                this.node.setStyles(this.selector.css.selectorItem_over);
            }
            this.actionNode.setStyles(this.selector.css.selectorItemActionNode_selected_over);
        }
    },
    outItem: function(){
        if (!this.isSelected){
            var styles = this.selector.css.selectorSelectedItem || this.selector.css.selectorItem;
            this.node.setStyles(styles);
        }else if( this.selector.css.selectorItem_over_force ){
            this.node.setStyles(this.selector.css.selectorItem_selected);
        }
        if (!this.isSelected){
            var styles = this.selector.css.selectorSelectedItemActionNode || this.selector.css.selectorItemActionNode;
            this.actionNode.setStyles(styles);
        }else if( this.selector.css.selectorItemActionNode_over_force ){
            this.node.setStyles(this.selector.css.selectorItemActionNode_selected);
        }
    },
    addItem: function(item){
        if (this.items.indexOf(item)===-1) this.items.push(item);
    },
    check: function(){
        if (this.selector.items.length){
            var items = this.selector.items.filter(function(item, index){
                return item.data.distinguishedName === this.data.distinguishedName;
            }.bind(this));
            this.items = items;
            if (items.length){
                items.each(function(item){
                    item.selectedItem = this;
                    item.setSelected();
                }.bind(this));
            }
        }
    },
    destroy: function(){
        if(this.node)this.node.destroy();
        delete this;
    }
});

MWF.xApplication.Selector.Person.ItemCategory = new Class({
    Extends: MWF.xApplication.Selector.Person.Item,
    initialize: function(data, selector, container, level, parentCategory){
        this.data = data;
        this.selector = selector;
        this.container = container;
        this.isSelected = false;
        this.level = (level) ? level.toInt() : 1;
        this.category = parentCategory;
        this.subItems = [];
        this.subCategorys = [];
        this.load();
    },

    createNode: function(){
        this.node = new Element("div", {
            "styles": this.selector.css.selectorItemCategory
        }).inject(this.container);
    },

    load: function(){
        this.selector.fireEvent("queryLoadCategory",[this]);
        this.createNode();
        this.levelNode = new Element("div", {
            "styles": this.selector.css.selectorItemLevelNode
        }).inject(this.node);
        var indent = this.selector.options.level1Indent + (this.level-1)*this.selector.options.indent;
        this.levelNode.setStyle("width", ""+indent+"px");

        this.iconNode = new Element("div", {
            "styles": this.selector.css.selectorItemIconNode
        }).inject(this.node);
        this._setIcon();

        this.actionNode = new Element("div", {
            "styles": (this.selector.options.expand) ? this.selector.css.selectorItemCategoryActionNode_expand : this.selector.css.selectorItemCategoryActionNode_collapse
        }).inject(this.node);

        if( this.selector.options.selectAllEnable && this.selector.options.count.toInt()!==1 ){
            this.selectAllNode = new Element("div", {
                "styles": this.selector.css.selectorItemCategoryActionNode_selectAll,
                "title" : "全选下级"
            }).inject(this.node);
            this.selectAllNode.addEvent( "click", function(ev){
                if( this.isSelectedAll ){
                    this.unselectAll(ev);
                    this.selector.fireEvent("unselectCatgory",[this])
                }else{
                    this.selectAll(ev);
                    this.selector.fireEvent("selectCatgory",[this])
                }
                ev.stopPropagation();
            }.bind(this));
            if( this.selector.css.selectorItemCategoryActionNode_selectAll_over ){
                this.selectAllNode.addEvents( {
                    "mouseover" : function(ev){
                        if( !this.isSelectedAll )this.selectAllNode.setStyles( this.selector.css.selectorItemCategoryActionNode_selectAll_over );
                        //ev.stopPropagation();
                    }.bind(this),
                    "mouseout" : function(ev){
                        if( !this.isSelectedAll )this.selectAllNode.setStyles( this.selector.css.selectorItemCategoryActionNode_selectAll );
                        //ev.stopPropagation();
                    }.bind(this)
                })
            }
        }

        this.textNode = new Element("div", {
            "styles": this.selector.css.selectorItemCategoryTextNode,
            "text": this._getShowName()
        }).inject(this.node);
        var m = this.textNode.getStyle("margin-left").toFloat()+indent;
        this.textNode.setStyle("margin-left", ""+m+"px");

        this.children = new Element("div", {
            "styles": this.selector.css.selectorItemCategoryChildrenNode
        }).inject(this.node, "after");
        if (!this.selector.options.expand) this.children.setStyle("display", "none");

        var subIdList = this.selector._getChildrenItemIds(this.data);
        if (subIdList){
            var count = subIdList.length;
            this.childrenHeight = count*29;
            this.children.setStyle("height", ""+this.childrenHeight+"px");
        }
        if (!this._hasChild()){
            this.actionNode.setStyle("background", "transparent");
            this.textNode.setStyle("color", "#777");
        }
        if( this.selectAllNode && !this._hasChildItem() ){
            this.selectAllNode.setStyle("display", "none");
        }

        this.setEvent();

        this.check();

        this.afterLoad();
        this.selector.fireEvent("postLoadCategory",[this]);
    },
    unselectAll : function(ev, exclude){
        var excludeList = exclude || [];
        if( exclude && typeOf(exclude) !== "array"  )excludeList = [exclude];
        ( this.subItems || [] ).each( function(item){
            if(item.isSelected && !excludeList.contains(item) ){
                item.unSelected();
            }
        }.bind(this));
        if( this.selectAllNode && this.selector.css.selectorItemCategoryActionNode_selectAll ){
            this.selectAllNode.setStyles( this.selector.css.selectorItemCategoryActionNode_selectAll );
        }
        this.isSelectedAll = false;
    },
    unselectAllNested : function( ev, exclude ){
        this.unselectAll(ev, exclude );
        if( this.subCategorys && this.subCategorys.length ){
            this.subCategorys.each( function( category ){
                category.unselectAllNested( ev, exclude )
            })
        }
    },
    selectAllNested : function(){
        this.selectAll();
        if( this.subCategorys && this.subCategorys.length ){
            this.subCategorys.each( function( category ){
                category.selectAllNested()
            })
        }
    },
    selectAll: function(ev){
        if( this.loaded ){
            this._selectAll( ev );
        }else{
            this.clickItem( function(){
                this._selectAll( ev );
                //this.children.setStyles({
                //    "display": "none",
                //    "height": "0px"
                //});
                //this.actionNode.setStyles(this.selector.css.selectorItemCategoryActionNode_collapse);
            }.bind(this));
        }
    },
    _selectAll : function( ev ){
        if( !this.subItems || !this.subItems.length )return;
        var count = this.selector.options.maxCount || this.selector.options.count;
        if (!count) count = 0;
        var selectedSubItemCount = 0;
        this.subItems.each( function(item){
            if(item.isSelected)selectedSubItemCount++
        }.bind(this));
        if ((count.toInt()===0) || (this.selector.selectedItems.length+(this.subItems.length-selectedSubItemCount))<=count){
            this.subItems.each( function(item){
                if(!item.isSelected)item.selected();
            }.bind(this))
            if( this.selectAllNode && this.selector.css.selectorItemCategoryActionNode_selectAll_selected ){
                this.selectAllNode.setStyles( this.selector.css.selectorItemCategoryActionNode_selectAll_selected );
            }
            this.isSelectedAll = true;
        }else{
            MWF.xDesktop.notice("error", {x: "right", y:"top"}, "最多可选择"+count+"个选项", this.node);
        }
    },
    afterLoad: function(){
        if (this.level===1) this.clickItem();
    },
    clickItem: function( callback ){
        if (this._hasChild()){
            if (!this.fx){
                this.fx = new Fx.Tween(this.children, {
                    "duration": 200
//                "transition": Fx.Transitions.Cubic.easeIn
                });
            };
            if (!this.fx.isRunning()){
                var display = this.children.getStyle("display");
                if (display === "none"){
                    this.children.setStyles({
                        "display": "block",
                        "height": "0px"
                    });
                    this.fx.start("height", "0px", ""+this.childrenHeight+"px");
                    this.actionNode.setStyles(this.selector.css.selectorItemCategoryActionNode_expand);

                }else{
                    if (!this.childrenHeight) this.childrenHeight = this.children.getStyle("height").toFloat();
                    this.fx.start("height", ""+this.childrenHeight+"px", "0px").chain(function(){
                        this.children.setStyles({
                            "display": "none",
                            "height": "0px"
                        });
                    }.bind(this));
                    this.actionNode.setStyles(this.selector.css.selectorItemCategoryActionNode_collapse);
                }
            }
            if(callback)callback()
        }
    },
    overItem: function(){
        //if (!this.isSelected){
        //    this.node.setStyles(this.selector.css.selectorItem_over);
        //    this.actionNode.setStyles(this.selector.css.selectorItemActionNode_over);
        //}
        if( this.selector.css.selectorItemCategory_over ){
            this.node.setStyles(this.selector.css.selectorItemCategory_over);
        }
        var display = this.children.getStyle("display");
        if( display === "none" ){
            if( this._hasChild() && this.selector.css.selectorItemCategoryActionNode_collapse_over ){
                this.actionNode.setStyles( this.selector.css.selectorItemCategoryActionNode_collapse_over )
            }
        }else{
            if( this._hasChild() && this.selector.css.selectorItemCategoryActionNode_expand_over ){
                this.actionNode.setStyles( this.selector.css.selectorItemCategoryActionNode_expand_over )
            }
        }

    },
    outItem: function(){
        //if (!this.isSelected){
        //    this.node.setStyles(this.selector.css.selectorItem);
        //    this.actionNode.setStyles(this.selector.css.selectorItemActionNode);
        //}
        if( this.selector.css.selectorItemCategory_over ){
            this.node.setStyles(this.selector.css.selectorItemCategory);
        }
        var display = this.children.getStyle("display");
        if( display === "none" ){
            if( this._hasChild() && this.selector.css.selectorItemCategoryActionNode_collapse_over ){
                this.actionNode.setStyles( this.selector.css.selectorItemCategoryActionNode_collapse )
            }
        }else{
            if( this._hasChild() && this.selector.css.selectorItemCategoryActionNode_expand_over ){
                this.actionNode.setStyles( this.selector.css.selectorItemCategoryActionNode_expand )
            }
        }
    },
    _hasChild: function(){
        var subIdList = this.selector._getChildrenItemIds(this.data);
        if (subIdList) if (subIdList.length) return true;
        return false;
    },
    _hasChildItem: function(){
        return this._hasChild();
    }
});

MWF.xApplication.Selector.Person.ItemGroupCategory = new Class({
    Extends: MWF.xApplication.Selector.Person.ItemCategory,
    _getShowName: function(){
        return this.data.name;
    },
    _setIcon: function(){
        this.iconNode.setStyle("background-image", "url("+"/x_component_Selector/$Selector/default/icon/groupicon.png)");
    }
});

MWF.xApplication.Selector.Person.ItemRoleCategory = new Class({
    Extends: MWF.xApplication.Selector.Person.ItemCategory,
    _getShowName: function(){
        return this.data.name;
    },
    _setIcon: function(){
        this.iconNode.setStyle("background-image", "url("+"/x_component_Selector/$Selector/default/icon/roleicon.png)");
    }
});


MWF.xApplication.Selector.Person.Filter = new Class({
    Implements: [Options, Events],
    options: {
        "style": "default",
        "groups": [],
        "roles": []
    },
    initialize: function(value, options){
        this.setOptions(options);
        this.value = value;
        this.orgAction = MWF.Actions.get("x_organization_assemble_control");
    },
    filter: function(value, callback){
        this.value = value;
        var key = this.value;

        if (this.options.groups.length || this.options.roles.length) key = {"key": key, "groupList": this.options.groupList, "roleList": this.options.roleList};
        this.orgAction.listPersonByKey(function(json){
            data = json.data;
            if (callback) callback(data)
        }.bind(this), null, key);
    }
});