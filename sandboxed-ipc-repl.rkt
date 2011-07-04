#lang racket
(require racket/sandbox)
(require racket/pretty)

(define e (make-evaluator 'racket/base '(require racket/list)))
(pretty-display (e (read)))
