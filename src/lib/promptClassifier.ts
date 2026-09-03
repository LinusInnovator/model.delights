export interface ClassificationResult {
    intent: 'coding' | 'reasoning' | 'agentic' | 'conversational' | 'fast_utility';
    requiresTools: boolean;
    requiresJsonSchema: boolean;
    requiresReasoning: boolean;
    estimatedTokens: number;
    hasPromptCachePotential: boolean;
    signals: string[];
}

// Pre-compiled regex patterns for high-throughput zero-latency execution (<0.2ms)
const CODE_FENCE_REGEX = /(```|~~~)(\w+)?[\s\S]*?(```|~~~)/;
const CODE_SYNTAX_REGEX = /\b(def|class|function|import|from|export|interface|type|const|let|var|async|await|return|SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|fn|impl|struct|pub|enum|package|namespace)\b/g;
const CODE_DIRECTIVES_REGEX = /\b(write code|implement|refactor|fix bug|debug|syntax error|regex|unit test|api endpoint|sql query|script|algorithm|leetcode|pull request|git diff|stack trace)\b/i;

const REASONING_DIRECTIVES_REGEX = /\b(think step by step|step-by-step|mathematical proof|prove that|counterexample|game theory|formal proof|derivation|derive the formula|theorem|axioms|deductive reasoning|causal inference|first principles|complex math|formal logic)\b/i;
const MATH_LATEX_REGEX = /(\\[a-zA-Z]+|\sum_|\int_|O\(n|\sqrt|\\frac)/;

const FAST_UTILITY_REGEX = /\b(translate|translation|summarize in one sentence|tl;?dr|extract keywords|sentiment|classify this|capitalize|rephrase this word|synonym)\b/i;

export function classifyPromptPayload(body: any): ClassificationResult {
    const signals: string[] = [];

    // 1. Tool & Structured Output Invariant
    const hasTools = Boolean(
        (Array.isArray(body?.tools) && body.tools.length > 0) ||
        (Array.isArray(body?.functions) && body.functions.length > 0) ||
        body?.tool_choice
    );

    const hasJsonSchema = Boolean(
        body?.response_format?.type === 'json_object' ||
        body?.response_format?.type === 'json_schema'
    );

    if (hasTools) signals.push('tools_present');
    if (hasJsonSchema) signals.push('json_schema_requested');

    // 2. Extract Text & Estimate Token Budget
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    let systemText = '';
    let userText = '';
    let totalText = '';

    for (const msg of messages) {
        let content = '';
        if (typeof msg.content === 'string') {
            content = msg.content;
        } else if (Array.isArray(msg.content)) {
            // Handle multimodal content parts
            content = msg.content
                .filter((p: any) => p && p.type === 'text' && typeof p.text === 'string')
                .map((p: any) => p.text)
                .join(' ');
        }

        totalText += content + ' ';

        if (msg.role === 'system' || msg.role === 'developer') {
            systemText += content + ' ';
        } else if (msg.role === 'user') {
            userText = content; // Keep latest user prompt
        }
    }

    const estimatedTokens = Math.max(1, Math.round(totalText.length / 4));
    
    // Prompt Cache threshold: 1,024+ tokens for Anthropic/DeepSeek or long system prompt
    const hasPromptCachePotential = systemText.length >= 2500 || totalText.length >= 4000;
    if (hasPromptCachePotential) signals.push('cache_threshold_met');

    // 3. Structural & Semantic Classification
    // Rule A: If tools or json_schema are required, force 'agentic'
    if (hasTools || hasJsonSchema) {
        return {
            intent: 'agentic',
            requiresTools: hasTools,
            requiresJsonSchema: hasJsonSchema,
            requiresReasoning: false,
            estimatedTokens,
            hasPromptCachePotential,
            signals
        };
    }

    // Rule B: Coding Detection
    const hasCodeFence = CODE_FENCE_REGEX.test(totalText);
    const syntaxMatches = (totalText.match(CODE_SYNTAX_REGEX) || []).length;
    const hasCodeDirective = CODE_DIRECTIVES_REGEX.test(userText);

    if (hasCodeFence || (syntaxMatches >= 3 && hasCodeDirective) || syntaxMatches >= 6) {
        signals.push('code_detected');
        return {
            intent: 'coding',
            requiresTools: false,
            requiresJsonSchema: false,
            requiresReasoning: false,
            estimatedTokens,
            hasPromptCachePotential,
            signals
        };
    }

    // Rule C: Deep Reasoning Detection
    const hasReasoningDirective = REASONING_DIRECTIVES_REGEX.test(userText);
    const hasMathLatex = MATH_LATEX_REGEX.test(userText);

    if (hasReasoningDirective || (hasMathLatex && estimatedTokens > 40)) {
        signals.push('deep_reasoning_detected');
        return {
            intent: 'reasoning',
            requiresTools: false,
            requiresJsonSchema: false,
            requiresReasoning: true,
            estimatedTokens,
            hasPromptCachePotential,
            signals
        };
    }

    // Rule D: Fast Utility (short, simple, deterministic task)
    if (estimatedTokens < 80 && FAST_UTILITY_REGEX.test(userText)) {
        signals.push('fast_utility_detected');
        return {
            intent: 'fast_utility',
            requiresTools: false,
            requiresJsonSchema: false,
            requiresReasoning: false,
            estimatedTokens,
            hasPromptCachePotential,
            signals
        };
    }

    // Rule E: Standard Conversational / General
    signals.push('general_conversational');
    return {
        intent: 'conversational',
        requiresTools: false,
        requiresJsonSchema: false,
        requiresReasoning: false,
        estimatedTokens,
        hasPromptCachePotential,
        signals
    };
}
