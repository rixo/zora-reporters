import { AssertionResult } from 'zora';
import { Output } from './output-stream';
export interface Diff {
    added: boolean;
    removed: boolean;
    padding: number;
    value: string;
}
export declare const valToTypeString: (val: unknown) => "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "array";
interface DiagnosticReporterFactory {
    (diag?: AssertionResult): {
        report(out: Output): void;
    };
}
export declare const truthyDiagnostic: DiagnosticReporterFactory;
export declare const falsyDiagnostic: DiagnosticReporterFactory;
export declare const notEqualDiagnostic: DiagnosticReporterFactory;
export declare const unknownOperatorDiagnostic: DiagnosticReporterFactory;
export declare const isDiagnostic: DiagnosticReporterFactory;
export declare const isNotDiagnostic: DiagnosticReporterFactory;
export declare const errorDiagnostic: DiagnosticReporterFactory;
export declare const countPadding: (string: string) => number;
export declare const expandNewLines: (val: Diff[], curr: Diff) => Diff[];
export declare const equalDiagnostic: DiagnosticReporterFactory;
export declare const getDiagnosticReporter: (diag: AssertionResult) => {
    report(out: Output): void;
};
export {};