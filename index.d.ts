import "chevrotain";

/**
 * A {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#document|Document}.
 */
export type Document = Node[];

/**
 * A {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#node|Node}.
 */
export interface Node {
  /** The name of the Node */
  name: string;
  /** Collection of {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#argument|Arguments} */
  values: Value[];
  /** Collection of {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#property|Properties} */
  properties: Record<string, Value>;
  /** Nodes in the {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#children-block|Children block} */
  children: Document;
  /** Collection of {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#type-annotation|type annotations} */
  tags: NodeTypeAnnotations;
}

/**
 * A {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#value|Value}.
 */
export type Value = string | number | boolean | null;

/**
 * The {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#type-annotation|Type annotations} associated with a {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#node|Node}.
 */
export interface NodeTypeAnnotations {
  /** The type annotation of the Node */
  name: string|undefined;
  /** The type annotations of the {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#argument|Arguments} */
  values: Array<string|undefined>;
  /** The type annotations of the {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#property|Properties} */
  properties: Record<string, string>;
}

/**
 * A {@link https://github.com/kdl-org/kdl/blob/main/QUERY-SPEC.md|Query string}.
 */
export type QueryString = string;

export interface ParseResult {
  /** Parsing errors */
  errors: chevrotain.IRecognitionException[];
  /** KDL Document */
  output?: Document;
}

/**
 * Formatting options
 */
export interface FormattingOptions {
  escapes?: Record<number, boolean>;
  requireSemicolons?: boolean;
  escapeNonAscii?: boolean;
  escapeNonPrintableAscii?: boolean;
  escapeCommon?: boolean;
  escapeLinespace?: boolean;
  newline?: string;
  indent?: number;
  indentChar?: string;
  exponentChar?: string;
  preferIdentifierString?: boolean;
  printEmptyChildren?: boolean;
  printNullArgs?: boolean;
  printNullProps?: boolean;
}

/**
 * @param {string} text - Input KDL file (or fragment)
 */
export function parse(text: string): ParseResult;

/**
 * @param {Document} doc - Input KDL document
 */
export function format(doc: Document, options?: FormattingOptions): string;

/**
 * @param {Document} doc - Input KDL document
 * @param {QueryString} queryString - Query for selecting and/or transforming results
 */
export function query(doc: Document, queryString: QueryString): any;

/**
 * @param {Document} doc - KDL document
 */
export function validateDocument(doc: Document): boolean;
