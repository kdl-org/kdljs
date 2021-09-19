import "chevrotain";

declare namespace kdljs {
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
  }

  /**
   * A {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#value|Value}.
   */
  export type Value = string | number | boolean | null;

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
    printEmptyChildren?: boolean;
    printNullArgs?: boolean;
    printNullProps?: boolean;
  }
}

/**
 * @param {string} text - Input KDL file (or fragment)
 */
export function parse(text: string): kdljs.ParseResult;

/**
 * @param {kdljs.Document} doc - Input KDL document
 */
export function format(doc: kdljs.Document, options?: kdljs.FormattingOptions): string;

/**
 * @param {kdljs.Document} doc - Input KDL document
 * @param {kdljs.QueryString} queryString - Query for selecting and/or transforming results
 */
export function query(doc: kdljs.Document, queryString: kdljs.QueryString): any;

/**
 * @param {kdljs.Document} doc - KDL document
 */
export function validateDocument(doc: kdljs.Document): boolean;
