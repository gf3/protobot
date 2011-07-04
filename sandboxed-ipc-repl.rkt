#lang racket
(require racket/sandbox)
(require racket/pretty)

(define e (make-evaluator 'racket/base))
(pretty-display (e (read)))
