<?php

declare(strict_types=1);

/*
 * This file is part of Contao Manager.
 *
 * (c) Contao Association
 *
 * @license LGPL-3.0-or-later
 */

namespace Contao\ManagerApi\HttpKernel;

use Contao\ManagerApi\Exception\ApiProblemException;
use Crell\ApiProblem\ApiProblem;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class ApiProblemResponse extends Response
{
    /**
     * Constructor.
     */
    public function __construct(ApiProblem $problem, array $headers = [])
    {
        if (!$problem->getStatus()) {
            $problem->setStatus(500);
        }

        if (!$problem->getTitle()) {
            $code = $problem->getStatus();
            $problem->setTitle(isset(Response::$statusTexts[$code]) ? Response::$statusTexts[$code] : 'unknown status');
        }

        parent::__construct(
            $problem->asJson(),
            $problem->getStatus(),
            array_merge($headers, ['Content-Type' => 'application/problem+json'])
        );
    }

    /**
     * Creates a ApiProblemResponse from exception.
     */
    public static function createFromException(\Exception $exception, bool $debug = false): self
    {
        $headers = [];

        if ($exception instanceof ApiProblemException) {
            $problem = $exception->getApiProblem();
        } else {
            $problem = new ApiProblem($exception->getMessage());

            if ($exception instanceof HttpExceptionInterface) {
                $problem->setStatus($exception->getStatusCode());
            }

            if ($debug) {
                $problem->setDetail($exception->getTraceAsString());
            }
        }

        if ($exception instanceof HttpExceptionInterface) {
            $headers = $exception->getHeaders();
        }

        return new static($problem, $headers);
    }
}
