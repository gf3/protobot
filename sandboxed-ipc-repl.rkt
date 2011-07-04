#lang racket
(require racket/sandbox)

(define e (make-evaluator 'racket/base))
(e (read))
