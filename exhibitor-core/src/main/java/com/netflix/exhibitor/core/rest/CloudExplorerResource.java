/*
 * Copyright 2012 Netflix, Inc.
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

package com.netflix.exhibitor.core.rest;

import com.netflix.exhibitor.core.activity.ActivityLog;
import org.apache.curator.utils.ZKPaths;
import org.codehaus.jackson.node.ArrayNode;
import org.codehaus.jackson.node.JsonNodeFactory;
import org.codehaus.jackson.node.ObjectNode;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.ext.ContextResolver;
import java.util.List;

@Path("exhibitor/v1/cloudExplorer")
public class CloudExplorerResource
{
    private final UIContext         context;
    private static final String         ERROR_KEY = "*";

    public CloudExplorerResource(@Context ContextResolver<UIContext> resolver)
    {
        context = resolver.getContext(UIContext.class);
    }

    @GET
    @Path("node-with-href")
    @Produces("application/json")
    public String   getNode(@QueryParam("key") String key, @QueryParam("href_prefix") String prefix,
            @QueryParam("href_suffix") String suffix) throws Exception
    {
        ArrayNode children = JsonNodeFactory.instance.arrayNode();
        try
        {
            List<String> childrenNames = context.getExhibitor().getLocalConnection().getChildren().forPath(key);
            SmartSort.sortChildren(childrenNames);
            for ( String name : childrenNames )
            {
                ObjectNode  node = children.addObject();
                node.put("title", name);
                node.put("key", ZKPaths.makePath(key, name));
                node.put("isLazy", true);
                node.put("expand", false);
                node.put("href", prefix + ZKPaths.makePath(key, name) + suffix);
            }
        }
        catch ( Throwable e )
        {
            context.getExhibitor().resetLocalConnection();
            context.getExhibitor().getLog().add(ActivityLog.Type.ERROR, "getNode: " + key, e);

            ObjectNode  node = children.addObject();
            node.put("title", "* Exception *");
            node.put("key", ERROR_KEY);
            node.put("isLazy", false);
            node.put("expand", false);
        }

        return children.toString();
    }

}
