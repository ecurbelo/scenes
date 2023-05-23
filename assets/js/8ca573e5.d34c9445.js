"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[95],{876:(e,n,t)=>{t.d(n,{Zo:()=>u,kt:()=>h});var a=t(2784);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,a)}return t}function r(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,a,i=function(e,n){if(null==e)return{};var t,a,i={},o=Object.keys(e);for(a=0;a<o.length;a++)t=o[a],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)t=o[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var s=a.createContext({}),p=function(e){var n=a.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):r(r({},n),e)),t},u=function(e){var n=p(e.components);return a.createElement(s.Provider,{value:n},e.children)},c="mdxType",d={inlineCode:"code",wrapper:function(e){var n=e.children;return a.createElement(a.Fragment,{},n)}},m=a.forwardRef((function(e,n){var t=e.components,i=e.mdxType,o=e.originalType,s=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),c=p(t),m=i,h=c["".concat(s,".").concat(m)]||c[m]||d[m]||o;return t?a.createElement(h,r(r({ref:n},u),{},{components:t})):a.createElement(h,r({ref:n},u))}));function h(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var o=t.length,r=new Array(o);r[0]=m;var l={};for(var s in n)hasOwnProperty.call(n,s)&&(l[s]=n[s]);l.originalType=e,l[c]="string"==typeof e?e:i,r[1]=l;for(var p=2;p<o;p++)r[p]=t[p];return a.createElement.apply(null,r)}return a.createElement.apply(null,t)}m.displayName="MDXCreateElement"},5690:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>s,contentTitle:()=>r,default:()=>d,frontMatter:()=>o,metadata:()=>l,toc:()=>p});var a=t(7896),i=(t(2784),t(876));const o={id:"visualizations",title:"Visualizations"},r="Visualizations",l={unversionedId:"visualizations",id:"visualizations",title:"Visualizations",description:"You can add visualizations to your scene by using the scene object class VizPanel.",source:"@site/../docs/visualizations.md",sourceDirName:".",slug:"/visualizations",permalink:"/scenes/docs/visualizations",draft:!1,editUrl:"https://github.com/grafana/scenes/edit/main/docusaurus/website/../docs/visualizations.md",tags:[],version:"current",frontMatter:{id:"visualizations",title:"Visualizations"},sidebar:"sidebar",previous:{title:"Building a scene layout",permalink:"/scenes/docs/scene-layout"},next:{title:"Variables",permalink:"/scenes/docs/variables"}},s={},p=[{value:"Simple <code>VizPanel</code> example",id:"simple-vizpanel-example",level:2},{value:"Data",id:"data",level:2},{value:"Header actions",id:"header-actions",level:2},{value:"Custom visualizations",id:"custom-visualizations",level:2}],u={toc:p},c="wrapper";function d(e){let{components:n,...t}=e;return(0,i.kt)(c,(0,a.Z)({},u,t,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"visualizations"},"Visualizations"),(0,i.kt)("p",null,"You can add visualizations to your scene by using the scene object class ",(0,i.kt)("inlineCode",{parentName:"p"},"VizPanel"),"."),(0,i.kt)("h2",{id:"simple-vizpanel-example"},"Simple ",(0,i.kt)("inlineCode",{parentName:"h2"},"VizPanel")," example"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts"},"new VizPanel({\n    pluginId: 'timeseries',\n    title: 'Time series',\n    options: {\n        legend: {\n            showLegend: false,\n        }\n    },\n    fieldConfig: {\n        defaults: {\n            unit: 'bytes',\n            min: 0,\n            custom: { lineWidth: 2 fillOpacity: 6 },\n        },\n        overrides: [],\n    }\n})\n")),(0,i.kt)("admonition",{type:"note"},(0,i.kt)("p",{parentName:"admonition"},"The pluginId, ",(0,i.kt)("inlineCode",{parentName:"p"},"timeseries"),", used in the preceding example refers to the core Grafana panel plugin, which is the standard graph visualization for time indexed data. The ",(0,i.kt)("inlineCode",{parentName:"p"},"options")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"fieldConfig")," are the same options you would see\nin a typical dashboard panel when you view the ",(0,i.kt)("strong",{parentName:"p"},"JSON")," tab in the panel inspect drawer. To access this tab, click ",(0,i.kt)("strong",{parentName:"p"},"Inspect > Panel JSON")," in the panel edit menu.")),(0,i.kt)("h2",{id:"data"},"Data"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"VizPanel")," uses the ",(0,i.kt)("inlineCode",{parentName:"p"},"sceneGraph.getData(model)")," call to find and subscribe to the closest parent that has a ",(0,i.kt)("inlineCode",{parentName:"p"},"SceneDataProvider")," object. This means ",(0,i.kt)("inlineCode",{parentName:"p"},"VizPanel")," uses ",(0,i.kt)("inlineCode",{parentName:"p"},"$data")," set on its own level or shares data with other siblings and scene objects if ",(0,i.kt)("inlineCode",{parentName:"p"},"$data")," is set on any parent level."),(0,i.kt)("h2",{id:"header-actions"},"Header actions"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"VizPanel")," has a property named ",(0,i.kt)("inlineCode",{parentName:"p"},"headerActions")," that can be either ",(0,i.kt)("inlineCode",{parentName:"p"},"React.ReactNode")," or a custom ",(0,i.kt)("inlineCode",{parentName:"p"},"SceneObject"),". This property is useful if you want to place links or buttons in the top right corner of the panel header. For example:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts"},'new VizPanel({\n  pluginId: \'timeseries\',\n  title: \'Time series\',\n  headerActions: (\n    <LinkButton size="sm" variant="secondary" href="scenes/drilldown/url">\n      Drilldown\n    </LinkButton>\n  ),\n});\n')),(0,i.kt)("p",null,"Buttons in the top right corner of the panel header can be used for:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Links to other scenes"),(0,i.kt)("li",{parentName:"ul"},"Buttons that change the current scene (add a drill-down page, for example)"),(0,i.kt)("li",{parentName:"ul"},"A ",(0,i.kt)("inlineCode",{parentName:"li"},"RadioButtonGroup")," that changes the visualization settings")),(0,i.kt)("p",null,"For ",(0,i.kt)("inlineCode",{parentName:"p"},"LinkButton"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"Button"),", and ",(0,i.kt)("inlineCode",{parentName:"p"},"RadioButtonGroup"),', use size="sm" when you place them in the panel header.'),(0,i.kt)("h2",{id:"custom-visualizations"},"Custom visualizations"),(0,i.kt)("p",null,"If you want to determine how data is visualized in your Grafana app plugin, you can do so in two ways. You always have the option to create a custom ",(0,i.kt)("inlineCode",{parentName:"p"},"SceneObject"),", but you won't get the ",(0,i.kt)("inlineCode",{parentName:"p"},"PanelChrome")," with loading state and other features\nthat ",(0,i.kt)("inlineCode",{parentName:"p"},"VizPanel")," provides. If you want a custom visualization inside a panel frame that should look like the other panels in your scene, then it's best to register a runtime panel plugin."),(0,i.kt)("p",null,"Start by defining your panel options and field config:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts"},"interface CustomVizOptions {\n  mode: string;\n}\n\ninterface CustomVizFieldOptions {\n  numericOption: number;\n}\n\ninterface Props extends PanelProps<CustomVizOptions> {}\n")),(0,i.kt)("p",null,"Then you can define the react component that renders your custom ",(0,i.kt)("inlineCode",{parentName:"p"},"PanelPlugin"),"."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts"},"export function CustomVizPanel(props: Props) {\n  const { options, data } = props;\n\n  return (\n    <div>\n      <h4>CustomVizPanel {options.mode}</h4>\n      <div>FieldConfig: {JSON.stringify(data.series[0]?.fields[0]?.config)}</div>\n    </div>\n  );\n}\n")),(0,i.kt)("p",null,"Now you're ready to create your ",(0,i.kt)("inlineCode",{parentName:"p"},"PanelPlugin")," instance and register it with the Scenes library:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts"},"import { sceneUtils } from '@grafana/scenes';\n\nconst myCustomPanel = new PanelPlugin<MyCustomOptions, MyCustomFieldOptions>(CustomVizPanel);\n\nsceneUtils.registerRuntimePanelPlugin({ pluginId: 'my-scene-app-my-custom-viz', plugin: myCustomPanel });\n")),(0,i.kt)("p",null,"You can now use this pluginId in any ",(0,i.kt)("inlineCode",{parentName:"p"},"VizPanel"),". Make sure you specify a pluginId that includes your scene app name and is unlikely to conflict with other Scenes apps."),(0,i.kt)("p",null,"For more information, refer to the official ",(0,i.kt)("a",{parentName:"p",href:"https://grafana.com/tutorials/build-a-panel-plugin"},"tutorial on building panel plugins"),". Just remember that for Scenes runtime panel plugins,\nyou don't need a plugin.json file for the panel plugin, as it won't be a standalone plugin that you can use in Dashboards. You'll only be able to reference the plugin inside your Scenes app."))}d.isMDXComponent=!0}}]);