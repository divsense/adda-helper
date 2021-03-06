// ADDA Helpers
//
require("array.prototype.find");

var props = function( obj ){
	return Object.keys( obj ).reduce(function(m,a){
		m.push( [ a, obj[ a ] ] );
		return m;
	}, []);
}

var makeNode = function( id, params ){

	return function(set){

		set = set || {};

		var s = set[ id ] = {};

		if( params.t ) s.t = params.t;

		if( params.u ) s.u = props( params.u );

		if( params.k ) s.k = props( params.k );

		return set;
	}
}

var setChildNodes = function( parentId, cids, branchName ){

	return function(set){

		branchName = branchName || "children-mmap";

		var node = set[ parentId ];

		node.c = node.c || [];

		node.c.push( [ branchName, cids] );

		cids.forEach( function(id){ set[id].p = parentId });

		return set;
	}
}

var setChild = function( parentId, childId, branchName ){

	return function(set){

		branchName = branchName || "children-mmap";

		var node = set[ parentId ];

		node.c = node.c || [];

		if( !node.c.length ){
			node.c.push( [ branchName, []] );
		}

		node.c = node.c.map(function(a){
			if( a[0] === branchName )
			a[1].push( childId );
		return a;
		});

		set[ childId ].p = parentId;

		return set;
	}
}

var addChildNode = function( parentId, id, params, branchName ){
	return function(set){
		return setChild( parentId, id, branchName )( makeNode( id, params)( set ) );
	}
}

var init = makeNode("__root__", {});

var toArray = function( set, id, array ){

	var node = set[ id ];
	node.id = id;
	delete node.p;

	array.push( node );

	return (node.c || []).reduce(function(acc,branch){

		acc = branch[1].reduce(function(m,a){
			m = toArray( set, a, m );
			return m;
		}, acc );

		return acc;

	}, array );
}

var getUnitData = function( level, dataAttr, node ){
	return (node[ level ] || [] ).reduce(function(m,a){
		if( a[0] === dataAttr ) m = a[1];
		return m;
	}, "");
}

var setUnitData = function( level, dataAttr, value, node ){

	node[ level ] = node[ level ] || [];

	var ud = node[ level ].find(function(a){ return a[0] === dataAttr });

	if( ud ){
		ud[1] = value;
	}
	else{
		node[ level ].push( [ dataAttr, value ] );
	}

	return node[ level ];
}

exports.makeNode = makeNode;
exports.setChildNodes = setChildNodes;
exports.setChild = setChild;
exports.init = init;

exports.addChildNode = addChildNode;
exports.getUnitData = getUnitData;
exports.setUnitData = setUnitData;

exports.toArray = function( set ){
	return toArray( set, "__root__", [] );
}

