var URL_CLOUD_EXPLORER_NODE = "../cloudExplorer/node-with-href";
var TEST_CLOUD_ROOT = getParameterByName("rootNode") == "" ? "/DavisRealRun/Baseline" : getParameterByName("rootNode");
var cloudExplorerSelectedPath = null;
var cloudExplorerSelectedBytes = null;
var cloudExplorerInitialExpandDone = false

function initCloudExplorer()
{
    $("#cloud-tree").dynatree({
        onActivate:function (node)
        {
            $.ajax
            (
                {
                    url: URL_EXPLORER_NODE_DATA,
                    data: {"key":node.data.key},
                    cache: false,
                    dataType: 'json',
                    success:function (data){
                        cloudExplorerSelectedPath = node.data.key;
                        cloudExplorerSelectedBytes = data.bytes;

                        $("#cloud-path").text(node.data.key);
                        $("#cloud-stat").text(data.stat);
                        $("#cloud-data-bytes").text(data.bytes);
                        $("#cloud-data-str").text(data.str);
                    }
                }
            );
            populateChildren(node);
            if (!node.isExpanded()) {
                node.expand(true);
            }
        },

        selectMode:1,

        children:[
            {title:"TestCloud", isFolder:true, isLazy:true, key: TEST_CLOUD_ROOT, noLink:true}
        ],

        onLazyRead: populateChildren,

        onClick: function (node, event) {
            cloudExplorerInitialExpandDone = true;
            if (node.getEventTargetType(event) == "expander") {
                node.reloadChildren(function (node, isOk) {
                });
            }
            return true;
        },

        persist: false
    });
    function populateChildren(node) {
        node.appendAjax
        (
            {
                url: URL_CLOUD_EXPLORER_NODE,
                data: {"key": node.data.key, "href_suffix": "#tabs-explorer-cloud", "href_prefix": "?selectedKey="},
                cache: false,
                success: function(node) {
                    var selectedKey = getParameterByName("selectedKey");
                    if (!cloudExplorerInitialExpandDone && selectedKey != null && selectedKey.indexOf(node.data.key) == 0) { //    TEST_CLOUD_ROOT
                        var nextPathPortionEnd = selectedKey.indexOf("/", node.data.key.length + 1);
                        if (nextPathPortionEnd < 0) {
                            nextPathPortionEnd = selectedKey.length;
                            cloudExplorerInitialExpandDone = true;
                        }
                        var availableToExpandPath = selectedKey.substring(0, nextPathPortionEnd);
                        console.log(availableToExpandPath);
                        var selectedNode = $("#cloud-tree").dynatree("getTree").getNodeByKey(availableToExpandPath);
                        if (selectedNode != null) {
                            selectedNode.activate();
                        }
                    }

                }
            }
        );

    }

    $("#cloud-tree").dynatree("getRoot").visit(function(node){
        node.expand(true);
    });

    $("#cloud-explorer-button-modify").button({
        icons:{
            primary:"ui-icon-pencil"
        }
    }).click(function(){
        var localData = cloudExplorerSelectedBytes;
        var localDataType;
        if ( !localData || !localData.length )
        {
            localData = "";
            localDataType = "string";
        }
        else
        {
            localDataType = "binary";
        }

        openModifyDialog("update", cloudExplorerSelectedPath, localData, localDataType);
        return false;
    });

}
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
